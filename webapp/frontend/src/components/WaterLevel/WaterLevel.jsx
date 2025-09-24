import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './WaterLevel.css';

const WaterLevel = ({ waterLevel, deviceId }) => {
  const waterRef = useRef(null);
  const [bubbleCount, setBubbleCount] = useState(0);
  const [aerationMode, setAerationMode] = useState(1); // 0: off, 1: auto, 2: on
  const [isSaving, setIsSaving] = useState(false);

  const BASE_URL = 'http://localhost:3000';
  const MODE_FROM_API = { off: 0, auto: 1, on: 2 };
  const MODE_TO_API = { 0: 'off', 1: 'auto', 2: 'on' };

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
      message: 'Воды достаточно', 
      color: '#F0FFF4', 
      text: '#2F855A' 
    }
  };

  const aerationConfig = [
    { label: 'Выкл', value: 0, color: '#E53E3E' },
    { label: 'Авто', value: 1, color: '#3182CE' },
    { label: 'Вкл', value: 2, color: '#38A169' }
  ];

  const status = waterLevel === 1 ? 'normal' : waterLevel === 0 ? 'nowater' : 'nodata';

  // Функция для переключения режима аэрации
  const handleAerationChange = (value) => {
    if (!deviceId || isSaving) return;
    const prev = aerationMode;
    const modeStr = MODE_TO_API[value] || 'auto';
    setAerationMode(value);
    setIsSaving(true);
    axios.post(
      '/control/aeration',
      { mode: modeStr },
      {
        baseURL: BASE_URL,
        params: { device_id: deviceId },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    ).catch((err) => {
      console.error('Не удалось установить режим аэрации:', err);
      setAerationMode(prev);
    }).finally(() => setIsSaving(false));
  };

  useEffect(() => {
    if (!waterRef.current || waterLevel !== 1) return;

    // Создаем пузырьки только если аэрация включена или в авторежиме при нормальном уровне воды
    const shouldCreateBubbles = aerationMode === 2 || (aerationMode === 1 && waterLevel === 1);

    if (!shouldCreateBubbles) return;

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
        if (bubble.parentNode) {
          bubble.remove();
        }
      }, 3000);
    };

    const bubbleInterval = setInterval(createBubble, 800);
    return () => clearInterval(bubbleInterval);
  }, [waterLevel, aerationMode]);

  // Загрузка текущего режима аэрации
  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;
    axios.get('/control/modes', {
      baseURL: BASE_URL,
      params: { device_id: deviceId },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then((res) => {
      if (cancelled) return;
      const apiMode = res.data?.aeration;
      if (apiMode && apiMode in MODE_FROM_API) {
        setAerationMode(MODE_FROM_API[apiMode]);
      }
    }).catch((err) => {
      console.error('Не удалось получить режимы управления:', err);
    });
    return () => { cancelled = true; };
  }, [deviceId]);

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
            
            {/* Переключатель аэрации под шкалой */}
            <div className="aeration-control">
              <div className="aeration-label">Аэрация</div>
              <div className="switch-selector">
                {aerationConfig.map((mode, index) => (
                  <button
                    key={mode.value}
                    className={`switch-option ${aerationMode === mode.value ? 'active' : ''}`}
                    onClick={() => handleAerationChange(mode.value)}
                    style={{
                      backgroundColor: aerationMode === mode.value ? mode.color : 'transparent',
                      color: aerationMode === mode.value ? 'white' : '#4A5568'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
                <div 
                  className="switch-slider"
                  style={{
                    transform: `translateX(${aerationMode * 100}%)`,
                    backgroundColor: aerationConfig[aerationMode].color
                  }}
                />
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
            
            {/* Переключатель аэрации для пустого резервуара */}
            <div className="aeration-control">
              <div className="aeration-label"> Режим аэрация</div>
              <div className="switch-selector">
                {aerationConfig.map((mode, index) => (
                  <button
                    key={mode.value}
                    className={`switch-option ${aerationMode === mode.value ? 'active' : ''}`}
                    onClick={() => handleAerationChange(mode.value)}
                    style={{
                      backgroundColor: aerationMode === mode.value ? mode.color : 'transparent',
                      color: aerationMode === mode.value ? 'white' : '#4A5568'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
                <div 
                  className="switch-slider"
                  style={{
                    transform: `translateX(${aerationMode * 100}%)`,
                    backgroundColor: aerationConfig[aerationMode].color
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default WaterLevel;