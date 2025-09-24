import React, { useEffect, useRef, useState } from 'react';
import './Temperature.css';

const Temperature = ({ temperature }) => {
  const mercuryRef = useRef(null);
  const [pulse, setPulse] = useState(false);

  const colors = {
    hot: '#FF6B6B',
    warm: '#FFA726',
    ideal: '#8ED7C6',
    cool: '#48BFE3',
    cold: '#5D9CEC',
    mercury: 'linear-gradient(to top, #FF6B6B, #FFA726, #8ED7C6, #48BFE3, #5D9CEC)',
    glass: 'rgba(255, 255, 255, 0.2)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    cardBackground: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)' // Бледный зеленый градиент
  };

  const getTemperatureStatus = (temp) => {
    if (temp === null) return 'nodata';
    if (temp >= 30) return 'hot';
    if (temp >= 25) return 'warm';
    if (temp >= 20) return 'ideal';
    if (temp >= 15) return 'cool';
    return 'cold';
  };

  const statusConfig = {
    nodata: { 
      message: 'Нет данных', 
      color: '#EDF2F7', 
      text: '#4A5568',
    },
    hot: {
      message: 'Слишком жарко!',
      color: '#FFF5F5',
      text: '#C53030',
      icon: '🔥',
      animation: 'pulse 1.5s infinite'
    },
    warm: {
      message: 'Тепло',
      color: '#FFFBEB',
      text: '#D97706',
      icon: '☀️'
    },
    ideal: { 
      message: 'Идеальная температура', 
      color: '#F0FFF4', 
      text: '#2F855A',
      icon: '✅'
    },
    cool: {
      message: 'Прохладно',
      color: '#EFF6FF',
      text: '#1E40AF',
      icon: '💧'
    },
    cold: {
      message: 'Слишком холодно!',
      color: '#EFF6FF',
      text: '#1E40AF',
      icon: '❄️',
      animation: 'pulse 1.5s infinite'
    }
  };

  const status = getTemperatureStatus(temperature);

  useEffect(() => {
    if (mercuryRef.current && temperature !== null) {
      const normalizedTemp = Math.max(10, Math.min(35, temperature));
      const height = ((normalizedTemp - 10) / 25) * 100;
      
      mercuryRef.current.style.height = `${height}%`;
      setPulse(status === 'hot' || status === 'cold');
    }
  }, [temperature, status]);

  return (
    <div 
      className="temperature-card"
      style={{ background: colors.cardBackground }}
    >
      <div className="temperature-header">
        <h2 className="temperature-title">
          <span className="icon">🌡️</span>Температура среды
        </h2>
      </div>

      <div className="temperature-display-container">
        <div className="thermometer-wrapper">
          <div className="thermometer">
            <div className="thermometer-bulb">
              <div className="thermometer-bulb-inner"></div>
            </div>
            
            <div className="thermometer-tube">
              <div className="thermometer-mercury-container">
                <div 
                  ref={mercuryRef} 
                  className={`thermometer-mercury ${pulse ? 'pulse' : ''}`}
                  style={{
                    background: colors.mercury
                  }}
                ></div>
              </div>
              
              {/* Горизонтальные линии шкалы */}
              {[0, 20, 40, 60, 80, 100].map((position) => (
                <div 
                  key={position}
                  className="scale-line" 
                  style={{ bottom: `${position}%` }}
                ></div>
              ))}
            </div>
            
            <div className="thermometer-scale">
              {[
                { value: 35, position: 100 },
                { value: 30, position: 80 },
                { value: 25, position: 60 },
                { value: 20, position: 40 },
                { value: 15, position: 20 },
                { value: 10, position: 0 }
              ].map((mark) => (
                <div 
                  key={mark.value}
                  className="scale-mark" 
                  style={{ bottom: `calc(${mark.position}% - 5px)` }}
                >
                  {mark.value}°
                </div>
              ))}
            </div>
          </div>

          {temperature !== null && (
            <div className="current-temperature">
              <span className="temperature-value">{temperature}°C</span>
            </div>
          )}
        </div>

        {temperature === null && (
          <div className="no-data-indicator">
            
          </div>
        )}
      </div>

      <div className="temperature-footer">
        <div 
          className="status-message"
          style={{
            backgroundColor: statusConfig[status].color,
            color: statusConfig[status].text,
            animation: statusConfig[status]?.animation
          }}
        >
          <span className="status-icon">{statusConfig[status].icon}</span>
          {statusConfig[status].message}
        </div>
      </div>
    </div>
  );
};

export default Temperature;