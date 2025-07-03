const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: '*', // или конкретный домен
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.static('public'));
app.use(express.json());

// Конфигурация
const JWT_SECRET = 'supersecretjwttokenblabla'; // Ключ шифрования паролей
const DEVICES = [
  {
    device_id: 'dev1',
    login: 'device1',
    password: '123',
  },
  {
    device_id: 'dev2',
    login: 'device2',
    password: '456',
  },
];

// SQLite подключение
const db = new sqlite3.Database('aquaponics.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(`SQLite error: ${err.message}`);
    process.exit(1);
  }
});

db.run('PRAGMA busy_timeout = 5000');
db.run('PRAGMA journal_mode = WAL'); 

// Инициализация таблиц
db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      device_id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS humidity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS light (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS light_switches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      last_reset_date TEXT NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    )
  `);

  // Вставка устройств в базу с применением шифрования на пароли
  for (const device of DEVICES) {
    try {
      const passwordHash = await bcrypt.hash(device.password, 10);
      db.run(
        'INSERT OR IGNORE INTO devices (device_id, login, password_hash) VALUES (?, ?, ?)',
        [device.device_id, device.login, passwordHash],
        (err) => {
          if (err) console.error(`SQLite insert device error: ${err.message}`);
        }
      );
    } catch (err) {
      console.error(`Bcrypt error for device ${device.device_id}: ${err.message}`);
    }
  }
});

// Очередь для операций вставки, если одновременно пришло много данных
const insertQueue = [];
let isProcessingQueue = false;

async function processInsertQueue() {
  if (isProcessingQueue || insertQueue.length === 0) return;
  isProcessingQueue = true;

  const { table, deviceId, value, timestamp } = insertQueue.shift();
  db.run(
    `INSERT INTO ${table} (device_id, value, timestamp) VALUES (?, ?, ?)`,
    [deviceId, value, timestamp],
    (err) => {
      if (err) console.error(`SQLite insert error (${table}): ${err.message}`);
      isProcessingQueue = false;
      processInsertQueue();
    }
  );
}

// Форматирование времени для занесения в базу
function getLocalTimestamp() {
  return new Date().toISOString(); // ISO 8601, всегда UTC, с Z
}

// Проверка jwt
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Сохраняем device_id из токена
    next();
  });
}

// MQTT подключение
const mqttClient = mqtt.connect('mqtt://213.171.15.35:1883', {
  reconnectPeriod: 1000,
  username: "device1", //логин для mqtt
  password: "aqua" //пароль для mqtt
});

const latestData = new Map();

// --- BUFFERS FOR HOURLY AVERAGE ---
const hourlyBuffer = {};

// --- HOURLY AVERAGE LOGIC ---
function getHourStart(date) {
  // YYYY-MM-DD HH:00:00
  return date.toISOString().slice(0, 13) + ':00:00';
}

function addToHourlyBuffer(deviceId, sensorType, value, timestamp) {
  const date = new Date(timestamp.replace(' ', 'T'));
  const hourStart = getHourStart(date);
  if (!hourlyBuffer[deviceId]) hourlyBuffer[deviceId] = {};
  if (!hourlyBuffer[deviceId][sensorType] || hourlyBuffer[deviceId][sensorType].hourStart !== hourStart) {
    // Если наступил новый час — сбрасываем, сохраняем среднее за прошлый час
    if (hourlyBuffer[deviceId][sensorType] && hourlyBuffer[deviceId][sensorType].values.length > 0) {
      const prevHour = hourlyBuffer[deviceId][sensorType].hourStart;
      const values = hourlyBuffer[deviceId][sensorType].values;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const roundedAvg = Math.round(avg * 10) / 10; // округление до 1 знака
      insertQueue.push({ table: sensorType, deviceId, value: roundedAvg, timestamp: prevHour });
      processInsertQueue();
    }
    // Новый час — новый массив
    hourlyBuffer[deviceId][sensorType] = { hourStart, values: [] };
  }
  hourlyBuffer[deviceId][sensorType].values.push(value);
}

mqttClient.on('connect', () => {
  mqttClient.subscribe(['aquaponics/+/humidity', 'aquaponics/+/light', 'aquaponics/+/water', 'aquaponics/+/VklSvet'], (err) => {
    if (err) {
      console.error(`MQTT subscribe error: ${err.message}`);
    }
  });
}); //подписка на топики

mqttClient.on('message', (topic, message) => {
  const messageStr = message.toString('utf8').trim(); // Явно указываем кодировку UTF-8 и удаляем пробелы

  const topicParts = topic.split('/');
  if (topicParts.length !== 3) {
    console.error(`Invalid topic format: ${topic}`);
    return;
  }
  const deviceId = topicParts[1];
  const sensorType = topicParts[2];

  if (sensorType === 'water') {
    const waterValue = parseInt(messageStr.replace(/\D/g, ''));
    const waterLevel = waterValue === 1 ? 1 : 0;
    
    console.log(`Received water_level from device ${deviceId}: ${waterLevel}`);
    
    if (!latestData.has(deviceId)) {
      latestData.set(deviceId, { humidity: 0, light: 0, water: 0 });
    }
    latestData.get(deviceId).water = waterLevel;
    return;
  }

  // Обработка VklSvet (счетчик включений)
  if (sensorType === 'VklSvet') {
    if (messageStr === '1') {
      // Логируем включение света
      console.log(`Received light switch activation from device ${deviceId}`);
      
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      db.get(
        'SELECT last_reset_date FROM light_switches WHERE device_id = ?',
        [deviceId],
        (err, row) => {
          if (err) {
            console.error(`SQLite select error (light_switches): ${err.message}`);
            return;
          }
          
          if (!row) {
            // Первое включение - создаем запись
            db.run(
              'INSERT INTO light_switches (device_id, count, last_reset_date) VALUES (?, 1, ?)',
              [deviceId, today]
            );
          } else if (row.last_reset_date !== today) {
            // Сброс счетчика если новый день
            db.run(
              'UPDATE light_switches SET count = 1, last_reset_date = ? WHERE device_id = ?',
              [today, deviceId]
            );
          } else {
            // Увеличиваем счетчик
            db.run(
              'UPDATE light_switches SET count = count + 1 WHERE device_id = ?',
              [deviceId]
            );
          }
        }
      );
    }
    return;
  }

  // Обработка humidity и light (числовые значения)
  const valueStr = messageStr.replace(/[^0-9.]/g, '');
  const value = parseFloat(valueStr);

  if (isNaN(value)) {
    console.error(`Некорректное значение получено на тему ${topic}: "${messageStr}" (очищенное: "${valueStr}")`);
    return;
  }

  // Проверяем, существует ли устройство
  db.get('SELECT 1 FROM devices WHERE device_id = ?', [deviceId], (err, row) => {
    if (err) {
      console.error(`SQLite select error (device): ${err.message}`);
      return;
    }
    if (!row) {
      console.error(`Unknown device_id: ${deviceId}`);
      return;
    }

    // Логируем полученные данные в консольку
    console.log(`Received ${sensorType} from device ${deviceId}: ${value}`);

    // Обновляем последние значения
    if (!latestData.has(deviceId)) {
      latestData.set(deviceId, { humidity: 0, light: 0, water: 0 });
    }
    const deviceData = latestData.get(deviceId);

    // Получаем локальное время
    const timestamp = getLocalTimestamp();

    // Добавляем в hourlyBuffer вместо insertQueue
    if (sensorType === 'humidity') {
      deviceData.humidity = value;
      addToHourlyBuffer(deviceId, 'humidity', value, timestamp);
    } else if (sensorType === 'light') {
      deviceData.light = value;
      addToHourlyBuffer(deviceId, 'light', value, timestamp);
    }
  });
});

mqttClient.on('error', (err) => {
  console.error(`MQTT error: ${err.message}`);
});

// API для аутентификации
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'login and password are required' });
  }

  db.get('SELECT device_id, password_hash FROM devices WHERE login = ?', [login], async (err, row) => {
    if (err) {
      console.error(`SQLite select error (login): ${err.message}`);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid login' });
    }

    try {
      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Создаём JWT-токен
      const token = jwt.sign({ device_id: row.device_id }, JWT_SECRET, { expiresIn: '1h' }); //время действия 1 час
      res.json({ token });
    } catch (err) {
      console.error(`Bcrypt error: ${err.message}`);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// API для текущих данных (доступ только авторизованным пользователям)
app.get('/humidity', authenticateToken, (req, res) => {
  const deviceId = req.query.device_id;
  if (!deviceId || deviceId !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }
  if (!latestData.has(deviceId)) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ humidity: latestData.get(deviceId).humidity });
});

app.get('/lightlevel', authenticateToken, (req, res) => {
  const deviceId = req.query.device_id;
  if (!deviceId || deviceId !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }
  if (!latestData.has(deviceId)) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ light: latestData.get(deviceId).light });
});

// API для получения статуса воды
app.get('/waterlevel', authenticateToken, (req, res) => {
  const deviceId = req.query.device_id;
  if (!deviceId || deviceId !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }
  if (!latestData.has(deviceId)) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ water: latestData.get(deviceId).water || 0 });
});

// API для получения счетчика включений света
app.get('/lightswitches', authenticateToken, (req, res) => {
  const deviceId = req.query.device_id;
  if (!deviceId || deviceId !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }

  db.get(
    'SELECT count FROM light_switches WHERE device_id = ?',
    [deviceId],
    (err, row) => {
      if (err) {
        console.error(`SQLite select error (light_switches): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ count: row ? row.count : 0 });
    }
  );
});

// API графика
app.get('/data/humidity', authenticateToken, (req, res) => {
  const { device_id, start, end, limit, timezone } = req.query;
  if (!device_id || device_id !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }
  const queryLimit = parseInt(limit) || 100;
  const startTime = start ? start : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const endTime = end ? end : new Date().toISOString().slice(0, 19).replace('T', ' ');

  const format = timezone === 'utc' ? `strftime('%Y-%m-%d %H:%M:%S', datetime(timestamp, '-3 hours'))` : `timestamp`;
  db.all(
    `SELECT value, ${format} as timestamp 
     FROM humidity 
     WHERE device_id = ? AND timestamp BETWEEN ? AND ? 
     ORDER BY timestamp ASC LIMIT ?`,
    [device_id, startTime, endTime, queryLimit],
    (err, rows) => {
      if (err) {
        console.error(`SQLite select error (humidity): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.get('/data/light', authenticateToken, (req, res) => {
  const { device_id, start, end, limit, timezone } = req.query;
  if (!device_id || device_id !== req.user.device_id) {
    return res.status(403).json({ error: 'Unauthorized device access' });
  }
  const queryLimit = parseInt(limit) || 100;
  const startTime = start ? start : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const endTime = end ? end : new Date().toISOString().slice(0, 19).replace('T', ' ');

  const format = timezone === 'utc' ? `strftime('%Y-%m-%d %H:%M:%S', datetime(timestamp, '-3 hours'))` : `timestamp`;
  db.all(
    `SELECT value, ${format} as timestamp 
     FROM light 
     WHERE device_id = ? AND timestamp BETWEEN ? AND ? 
     ORDER BY timestamp ASC LIMIT ?`,
    [device_id, startTime, endTime, queryLimit],
    (err, rows) => {
      if (err) {
        console.error(`SQLite select error (light): ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});


app.get('/user/device', authenticateToken, (req, res) => {
  // извлечение device_id
  res.json({ device_id: req.user.device_id });
});

// Запуск сервера
const server = app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});

// мягкое отключение сервера
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) console.error(`Error closing SQLite: ${err.message}`);
      mqttClient.end();
      console.log('Server stopped');
      process.exit(0);
    });
  });
});