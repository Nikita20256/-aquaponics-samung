import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <span className="navbar-logo" onClick={() => navigate('/')}>
            Fish & Greens
          </span>
          <div className="navbar-links">
            <NavButton onClick={() => navigate('/')}>Главная</NavButton>
            { <NavButton onClick={() => navigate('/plants')}>Наши растения</NavButton>}
            {token && <NavButton onClick={() => navigate('/dashboard')}>Мое устройство</NavButton>}
          </div>
        </div>
        {token ? (
          <NavButton onClick={handleLogout}>Выход</NavButton>
        ) : (
          <NavButton onClick={() => navigate('/login')}>Вход</NavButton>
        )}
      </div>
    </nav>
  );
}

function NavButton({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      className="nav-button"
      style={style}
    >
      {children}
    </button>
  );
}

export default Navbar;