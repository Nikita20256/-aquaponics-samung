import React from "react";
import "./Plants.css";
import rukolaImg from "./assets/images/rukola.png";
import bazilikImg from "./assets/images/bazilik.png";
import redisImg from "./assets/images/redis.png";
import backgroundImage from "./assets/images/flot.png";

function Plants() {
  return (
    <div className="plants-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="plants-overlay"></div>
      
      <div className="plants-content">
        {/* Руккола */}
        <div className="plant-section">
          <h1 className="plant-title">Руккола</h1>
          <div className="plant-text-content">
            <div className="plant-text">
              <p className="plant-subtitle">Содержит:</p>
              <ul className="plant-list">
                <li>Битамины: С (укрепляет иммунитет), К (для костей и крови), А (для зрения и кожи), Фоматы (Б9)</li>
                <li>Минералы: кальций, магний, железо, калий, йод</li>
              </ul>
              <p className="plant-description">
                Микрозелень рукколы — это суперфуд, который превосходит средую эсмень по содержанию витаминов и антиоксидантов. Всего горсть таких ростков в день укрепляет здоровье, защищает от болезней и делает питание более полезным.
              </p>
            </div>
            <div className="plant-image-wrapper">
              <img src={rukolaImg} alt="Руккола" className="plant-image" />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Базилик */}
        <div className="plant-section">
          <h1 className="plant-title">Базилик</h1>
          <div className="plant-text-content">
            <div className="plant-text">
              <p className="plant-subtitle"> Микрозелень базилия содержит:</p>
              <ul className="plant-list">
                <li>Битамины: С, К, А, Е, группы В (Фоматы, рибограмми)</li>
                <li>Минералы: кальций, магний, железо, калий, цинк</li>
              </ul>
              <p className="plant-description">
              Микрозелень базилия — это не только вкусная, но и очень полезная добавка к рациону, которая укрепляет здоровье и обогащает питание ценными веществами.
              </p>
            </div>
            <div className="plant-image-wrapper">
              <img src={bazilikImg} alt="Базилик" className="plant-image" />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Редис */}
        <div className="plant-section">
          <h1 className="plant-title">Редис</h1>
          <div className="plant-text-content">
            <div className="plant-text">
              <p className="plant-subtitle">Содержит:</p>
              <ul className="plant-list">
                <li>С (аскорбиновая кислота) – укрепляет иммунитет, антиоксидант</li>
                <li>А (бега-карити) – полезен для зрения и кожи</li>
                <li>К – важен для свертываемости крови и здоровья костей</li>
                <li>Группа В (В6, В9 – Фоматы) – поддерживают нервную систему</li>
              </ul>
              <p className="plant-description">
              Микрозелень редиса – это маленькое чудо природы, которое дарит нам море здоровья, вкуса и радости!
              </p>
            </div>
            <div className="plant-image-wrapper">
              <img src={redisImg} alt="Редис" className="plant-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plants;