import React, { useEffect, useRef, useState } from 'react';
import './Temperature.css';

const Temperature = ({ waterLevel }) => {
  const waterRef = useRef(null);
  const [bubbleCount, setBubbleCount] = useState(0);

  const colors = {
    water: '#5D9CEC',
    waterSurface: '#7AB3FF',
    glass: 'rgba(255, 255, 255, 0.2)',
    glassBorder: '#E2E8F0',
    bubble: 'rgba(255, 255, 255, 0.4)',
    emptyTank: '#F7FAFC'
  };

  const statusConfig = {
    nodata: { 
      message: 'Данные отсутствуют', 
      color: '#EDF2F7', 
      text: '#4A5568' 
    },
    nowater: {
      message: 'Воды мало!',
      color: '#FFF5F5',
      text: '#C53030',
      animation: 'pulse 1.5s infinite'
    },
    normal: { 
      message: 'Водаы достаточно', 
      color: '#F0FFF4', 
      text: '#2F855A' 
    }
  };

  const status = waterLevel === 1 ? 'normal' : waterLevel === 0 ? 'nowater' : 'nodata';

  useEffect(() => {
    if (!waterRef.current || waterLevel !== 1) return;

    const container = waterRef.current;
    const createBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = 'water-bubble';

      const size = Math.random() * 10 + 5;
      const left = Math.random() * 80 + 10;
      const delay = Math.random() * 3;

      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: 0;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;

      container.appendChild(bubble);
      setBubbleCount(prev => prev + 1);

      setTimeout(() => {
        bubble.remove();
      }, 3000);
    };

    const bubbleInterval = setInterval(createBubble, 800);
    return () => clearInterval(bubbleInterval);
  }, [waterLevel]);

  return (
    <div className="water-card">
      <div className="water-header">
        <h2 className="water-title">
          <span className="icon">💧</span>Вода в аквапонике
        </h2>
      </div>

      <div className="water-display-container">
        {waterLevel === 1 ? (
          <div className="water-tank">
            <div className="glass-container" ref={waterRef}>
              {/* Стеклянный резервуар */}
              <div className="glass">
                {/* Вода */}
                <div 
                  className="water-fill" 
                  style={{
                    background: `linear-gradient(to bottom, ${colors.waterSurface}, ${colors.water})`,
                  }}
                >
                  {/* Блеск на поверхности воды */}
                  <div className="water-shine"></div>
                </div>
                
                {/* Полоски на стекле */}
                <div className="glass-stripes">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="glass-stripe"></div>
                  ))}
                </div>
              </div> 
            </div>
          </div>
        ) : (
          <div className="empty-tank-visual">
            <div className="glass-container">
              <div className="glass empty">
                {waterLevel === null && <div className="no-data-icon">❓</div>}
              </div> 
            </div>
           
          </div>
        )}
      </div>

      <div className="water-footer">
        <div 
          className="status-message"
          style={{
            backgroundColor: statusConfig[status].color,
            color: statusConfig[status].text,
            animation: statusConfig[status]?.animation
          }}
        >
          {statusConfig[status].message}
        </div>
      </div>
    </div>
  );
};

export default Temperature;