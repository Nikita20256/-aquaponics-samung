import React, { useState } from 'react';
import './LightIntensity.css';

const LightIntensity = ({ lightLevel, lightSwitches }) => {
  const [lightMode, setLightMode] = useState(1); // 0: off, 1: auto, 2: on

  // Упрощенная цветовая палитра
  const colors = {
    dark: '#3A5C40',    // Темнота
    medium: '#7CB45D',  // Средний уровень
    bright: '#F0A830',  // Яркий свет
    textDark: '#1E3B23'
  };

  const lightConfig = [
    { label: 'Выкл', value: 0, color: '#E53E3E' },
    { label: 'Авто', value: 1, color: '#3182CE' },
    { label: 'Вкл', value: 2, color: '#38A169' }
  ];

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

  // Функция для переключения режима освещения
  const handleLightModeChange = (value) => {
    setLightMode(value);
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

      {/* Блок с переключателем режима освещения */}
      <div className="light-control">
        <div className="light-control-label">Режим света</div>
        <div className="switch-selector">
          {lightConfig.map((mode, index) => (
            <button
              key={mode.value}
              className={`switch-option ${lightMode === mode.value ? 'active' : ''}`}
              onClick={() => handleLightModeChange(mode.value)}
              style={{
                backgroundColor: lightMode === mode.value ? mode.color : 'transparent',
                color: lightMode === mode.value ? 'white' : '#4A5568'
              }}
            >
              {mode.label}
            </button>
          ))}
          <div 
            className="switch-slider"
            style={{
              transform: `translateX(${lightMode * 100}%)`,
              backgroundColor: lightConfig[lightMode].color
            }}
          />
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