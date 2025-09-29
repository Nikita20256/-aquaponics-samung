import React from 'react';
import './Humidity.css';

const Humidity = ({ humidity }) => {
  const colors = {
    dry: '#E05038',      // Цвет для сухого состояния
    wet: '#3A5C40',      // Цвет для влажного состояния
    textDark: '#1E3B23'  // Цвет текста
  };

  const getHumidityColor = (hum) => {
    if (hum === null) return colors.textDark;
    if (hum < 30) return colors.dry;  // Порог 50% для разделения
    return colors.wet;
  };

  const getStatusMessage = (hum) => {
    if (hum === null) return 'Нет данных';
    if (hum < 30) return '🏜️ Сухо';  // Меньше 50% - сухо
    return '💧 Влажно';              // 50% и выше - влажно
  };

  return (
    <div className="humidity-card">
      <div className="humidity-header">
        <h2 className="humidity-title">
          <span className="icon">💧</span> Влажность
        </h2>
        <div className="weather-icons">
          <span className="icon">☀️</span>
          <span className="icon">🌧️</span>
        </div>
      </div>

      <div className="humidity-display">
        <div className="humidity-value" style={{ color: getHumidityColor(humidity) }}>
          {humidity !== null ? humidity.toFixed(0) : '--'}
          <span className="humidity-unit">%</span>
        </div>
        <div className="humidity-scale">
          <span style={{ color: colors.dry }}>0%</span>
          <div className="scale-bar">
            <div 
              className="scale-progress" 
              style={{
                width: humidity ? `${humidity}%` : '0%',
                backgroundColor: getHumidityColor(humidity)
              }}
            />
          </div>
          <span style={{ color: colors.wet }}>100%</span>
        </div>
      </div>

      <div className="humidity-footer">
        <p className="status-message">
          {getStatusMessage(humidity)}
        </p>
      </div>
    </div>
  );
};

export default Humidity;