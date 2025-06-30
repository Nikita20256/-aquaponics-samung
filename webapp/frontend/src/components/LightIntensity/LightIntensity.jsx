import React from 'react';
import './LightIntensity.css';

const LightIntensity = ({ lightLevel, lightSwitches }) => {
  // Упрощенная цветовая палитра
  const colors = {
    dark: '#3A5C40',    // Темнота
    medium: '#7CB45D',  // Средний уровень
    bright: '#F0A830',  // Яркий свет
    textDark: '#1E3B23'
  };

  const getLightColor = (light) => {
    if (light === null) return colors.textDark;
    if (light < 400) return colors.dark;
    if (light <= 800) return colors.medium;
    return colors.bright;
  };

  const getPercentage = (light) => {
    if (!light) return 0;
    return Math.min(100, (light / 1000) * 100); // Максимум 1000 для шкалы
  };

  return (
    <div className="light-card">
      <div className="light-header">
        <h1 className="light-title">
          <span className="icon">🌿</span> Освещенность аквапоники
        </h1>
        <div className="light-icons">
          <span className="icon">🌲</span>
        </div>
      </div>

      <div className="light-display">
        <div className="light-value" style={{ color: getLightColor(lightLevel) }}>
          {lightLevel !== null ? lightLevel.toLocaleString() : '--'}
          <span className="light-unit">lux</span>
        </div>
        <div className="light-scale">
          <span style={{ color: colors.dark }}>0</span>
          <div className="scale-bar">
            <div 
              className="scale-progress" 
              style={{
                width: `${getPercentage(lightLevel)}%`,
                backgroundColor: getLightColor(lightLevel)
              }}
            />
          </div>
          <span style={{ color: colors.bright }}>1k</span>
        </div>
      </div>

      {/* Блок с счетчиком включений */}
      <div className="light-display-count">
        <div className="count-title">Включений света сегодня:</div>
        <div className="count-value">
          {lightSwitches !== null ? lightSwitches : '--'}
        </div>
      </div>

      <div className="light-footer">
        {lightLevel !== null && (
          <div className="status-message">
            {lightLevel < 400 ? (
              <>🌑 Темно (ниже 400 lux)</>
            ) : lightLevel <= 800 ? (
              <>🌥️ Средне (400-800 lux)</>
            ) : (
              <>☀️ Светло (выше 800 lux)</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LightIntensity;