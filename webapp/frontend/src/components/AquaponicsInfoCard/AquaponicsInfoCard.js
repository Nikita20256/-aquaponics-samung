import React, { useState, useEffect } from 'react';
import './AquaponicsInfoCard.css';
import deviceImage from '../assets/images/auco.png';

const AQUAPONICS_FACTS = [
  "Аквапонические системы на 40% эффективнее традиционного земледелия по потреблению ресурсов 1 кг рыбы производит достаточно питательных веществ для 50 кг растений!",
  "Средняя аквапоническая система экономит до 20 000 литров воды в год.Кои могут прожить в аквапонике до 40 лет - дольше, чем домашние кошки!",
  "Салат в аквапонике созревает за 30 дней вместо 60 в почве. Базилик из аквапоники содержит на 15% больше эфирных масел",
  "Идеальный pH для системы: 6.8-7.0 (нейтральная среда). Аквапоника полностью исключает использование пестицидов",
  "Система работает бесшумно - уровень звука менее 30 дБ. Ночью растения продолжают поглощать нитраты, очищая воду для рыб",
  "Тилапия - идеальная рыба для новичков: неприхотлива и быстро растёт. Клубника в аквапонике даёт урожай в 2 раза чаще",
  "Система потребляет меньше энергии, чем холодильник. Кормите рыб 3 раза в день небольшими порциями для оптимального роста Аквапоника имитирует естественный круговорот веществ в природе",
  "Первые аквапонические системы использовались ещё ацтеками. Растения поглощают до 95% отходов жизнедеятельности рыб",
  
];

const FISH_ICONS = ['🐟', '🐠', '🦐', '🐡', '🦈', '🐋'];
const PLANT_ICONS = ['🌱', '🌿', '🍀', '☘️', '🌴', '🌾', '🌻'];

const AquaponicsInfoCard = ({ deviceId }) => {
  const [currentFact, setCurrentFact] = useState('');
  const [fishImage, setFishImage] = useState(FISH_ICONS[0]);
  const [plantImage, setPlantImage] = useState(PLANT_ICONS[0]);

  const updateFactAndIcons = () => {
    setCurrentFact(AQUAPONICS_FACTS[Math.floor(Math.random() * AQUAPONICS_FACTS.length)]);
    setFishImage(FISH_ICONS[Math.floor(Math.random() * FISH_ICONS.length)]);
    setPlantImage(PLANT_ICONS[Math.floor(Math.random() * PLANT_ICONS.length)]);
  };

  useEffect(() => {
    updateFactAndIcons();
    const factInterval = setInterval(updateFactAndIcons, 15000); // Чаще обновляем факты
    return () => clearInterval(factInterval);
  }, []);

  return (
    <div className="aquaponics-card">
      <div className="device-info-section">
        <div className="device-image-container">
          <img 
            src={deviceImage} 
            alt="Аквапоническая система" 
            className="device-image"
          />
        </div>
        <h3>Система #{deviceId}</h3>
        <div className="status-indicator">
          <span className="status-dot"></span>
        </div>
      </div>
      
      <div className="fact-section">
        <div className="fact-header">
          <div className="icons-row">
            <span className="icon">{fishImage}</span>
            <span className="icon">{plantImage}</span>
          </div>
          <h4>Интересный факт</h4>
        </div>
        <div className="fact-content">
          <p>{currentFact}</p>
        </div>
      </div>
    </div>
  );
};

export default AquaponicsInfoCard;