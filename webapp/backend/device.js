const mqtt = require('mqtt');

// Конфигурация
const MQTT_BROKER = 'mqtt://213.171.15.35:1883';
const DEVICES = [
  {
    device_id: 'dev1',
    login: 'device1', // Не используется в MQTT, для консистентности
    password: 'securepassword123', // Не используется в MQTT
  },
  {
    device_id: 'dev2',
    login: 'device2', // Не используется в MQTT
    password: 'anotherpassword456', // Не используется в MQTT
  },
  // Добавьте другие устройства здесь
];

// Подключение к MQTT-брокеру
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('Device simulator connected to MQTT broker');

  // Отправка данных для каждого устройства
  setInterval(() => {
    DEVICES.forEach((device) => {
      const deviceId = device.device_id;

      // Генерация температуры (20–40 °C)
      const temperature = (20 + Math.random() * 20).toFixed(1);
      client.publish(`aquaponics/${deviceId}/temperature`, temperature);
      console.log(`Sent temperature for ${deviceId}: ${temperature}`);

      // Генерация влажности (30–80 %)
      const humidity = (30 + Math.random() * 50).toFixed(1);
      client.publish(`aquaponics/${deviceId}/humidity`, humidity);
      console.log(`Sent humidity for ${deviceId}: ${humidity}`);

      // Генерация освещения (0–1000 люкс)
      const light = (Math.random() * 1000).toFixed(1);
      client.publish(`aquaponics/${deviceId}/light`, light);
      console.log(`Sent light for ${deviceId}: ${light}`);
    });
  }, 30000);
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});