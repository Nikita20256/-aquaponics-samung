import React, { useState } from "react";
import "./Plants.css";
import rukolaImg from "./assets/images/image 6.svg";
import bazilikImg from "./assets/images/image 17.svg";
import redisImg from "./assets/images/image 18.svg";

function Plants() {
  const [selectedPlant, setSelectedPlant] = useState(null);

  const plantsData = {
    rukola: {
      name: "Руккола",
      image: rukolaImg,
      description: "Микрозелень рукколы — это суперфуд, который превосходит зрелую зелень по содержанию витаминов и антиоксидантов. Всего горсть таких ростков в день укрепляет здоровье, защищает от болезней и делает питание более полезным.",
      contains: [
        "Витамины: С (укрепляет иммунитет), К (для костей и крови), А (для зрения и кожи), Фолаты (Б9)",
        "Минералы: кальций, магний, железо, калий, йод"
      ]
    },
    bazilik: {
      name: "Базилик",
      image: bazilikImg,
      description: "Микрозелень базилика — это не только вкусная, но и очень полезная добавка к рациону, которая укрепляет здоровье и обогащает питание ценными веществами.",
      contains: [
        "Витамины: С, К, А, Е, группы В (Фолаты, рибофлавин)",
        "Минералы: кальций, магний, железо, калий, цинк"
      ]
    },
    redis: {
      name: "Редис",
      image: redisImg,
      description: "Микрозелень редиса – это маленькое чудо природы, которое дарит нам море здоровья, вкуса и радости!",
      contains: [
        "С (аскорбиновая кислота) – укрепляет иммунитет, антиоксидант",
        "А (бета-каротин) – полезен для зрения и кожи",
        "К – важен для свертываемости крови и здоровья костей",
        "Группа В (В6, В9 – фолаты) – поддерживают нервную систему"
      ]
    }
  };

  const handleCardClick = (plantKey) => {
    setSelectedPlant(plantsData[plantKey]);
  };

  const closeModal = () => {
    setSelectedPlant(null);
  };

  return (
    <div className="plants-container">
      <div className="plants-background">
        <div className="background-overlay"></div>
      </div>
      
      <div className="plants-content">
        <div className="plants-grid">
          {/* Руккола */}
          <div className="plant-card" onClick={() => handleCardClick('rukola')}>
            <div className="plant-image-container">
              <img src={rukolaImg} alt="Руккола" className="plant-image" />
            </div>
            <div className="plant-name">Руккола</div>
          </div>

          {/* Базилик */}
          <div className="plant-card" onClick={() => handleCardClick('bazilik')}>
            <div className="plant-image-container">
              <img src={bazilikImg} alt="Базилик" className="plant-image" />
            </div>
            <div className="plant-name">Базилик</div>
          </div>

          {/* Редис */}
          <div className="plant-card" onClick={() => handleCardClick('redis')}>
            <div className="plant-image-container">
              <img src={redisImg} alt="Редис" className="plant-image" />
            </div>
            <div className="plant-name">Редис</div>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h2 className="modal-title">{selectedPlant.name}</h2>
            </div>
            
            <div className="modal-body">
              <div className="modal-image-container">
                <img src={selectedPlant.image} alt={selectedPlant.name} className="modal-image" />
              </div>
              
              <div className="modal-info">
                <div className="info-section">
                  <h3 className="info-title">Содержит:</h3>
                  <ul className="info-list">
                    {selectedPlant.contains.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="description-section">
                  <p className="plant-description">{selectedPlant.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plants;