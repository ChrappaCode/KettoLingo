import { Link, useNavigate } from 'react-router-dom';
import styles from './header.module.css'; // A külön CSS fájl a stílusokhoz
import { useEffect, useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  return (
    isLoggedIn && (
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link to="/">KettőLingo</Link>
        </div>
        <div className={styles.navLinks}>
          <Link to="/profile" className={styles.navLink}>Profile</Link>
          <Link to="/overview" className={styles.navLink}>Overview</Link>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      </nav>
    )
  );
}

export default Header;
