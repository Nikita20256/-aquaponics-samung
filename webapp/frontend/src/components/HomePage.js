import { useNavigate } from 'react-router-dom';

import './HomePage.css';
import '../styles/fonts.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
  
      <div className="background-overlay"></div>
      
      <div className="content-wrapper">
        <h1 className="main-title">
          Аквапоника
        </h1>
        
        <div className="description-text">
          <p>
            Высокотехнологичный способ ведения сельского хозяйства, сочетающий аквакультуру и гидропонику.
            Мы предлагаем вам опробовать новый мир домашнего выращивания растений.
          </p>
        </div>
        
        <div className="button-container">
          <button 
            onClick={() => navigate('/plants')}
            className="cta-button"
          >
            Окунуться!
          </button>
        </div>
      </div>
    </div>
  );
}