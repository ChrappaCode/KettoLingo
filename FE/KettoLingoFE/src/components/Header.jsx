import { Link, useNavigate } from 'react-router-dom';
import styles from './header.module.css';
import { useEffect, useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsLoggedIn(true);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 470);
    };

    handleResize(); // Azonnali ellenőrzés
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    isLoggedIn && (
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link to="/">KettőLingo</Link>
        </div>
        {isMobile ? (
          <div className={styles.hamburger} onClick={toggleMenu}>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
          </div>
        ) : (
          <div className={styles.navLinks}>
            <Link to="/profile" className={styles.navLink}>Profile</Link>
            <Link to="/overview" className={styles.navLink}>Overview</Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        )}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/profile" className={styles.navLink} onClick={toggleMenu}>Profile</Link>
            <Link to="/overview" className={styles.navLink} onClick={toggleMenu}>Overview</Link>
            <button onClick={() => { handleLogout(); toggleMenu(); }} className={styles.logoutButton}>Logout</button>
          </div>
        )}
      </nav>
    )
  );
}

export default Header;
