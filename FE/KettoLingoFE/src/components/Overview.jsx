import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from "./overview.module.css";

function Overview() {
  const [data, setData] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
    }

    const fetchProtectedData = fetch('http://127.0.0.1:5000/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      return response.json();
    })
    .then(data => setData(data))
    .catch(error => {
      console.error('Error fetching protected data:', error);
      navigate('/login');
    });

    const fetchLanguages = fetch('http://127.0.0.1:5000/api/languages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(languages => {
      if (Array.isArray(languages)) {
        setLanguages(languages);
      } else {
        setLanguages([]);
      }
    })
    .catch(error => {
      console.error('Error fetching languages:', error);
      setLanguages([]);
    });

    Promise.all([fetchProtectedData, fetchLanguages]).then(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Overview Page</h2>
        <p className={styles.subtitle}>{data ? `Logged in as: ${data.logged_in_as.email}` : "Loading..."}</p>
        <div>
          <label>Select a Language: </label>
          <select className={styles.select} value={selectedLanguage} onChange={handleLanguageChange}>
            <option value="" disabled>Select a language</option>
            {languages.length > 0 ? (
              languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))
            ) : (
              <option disabled>No languages available</option>
            )}
          </select>
        </div>
        {selectedLanguage && (
          <div>
            <h3>What would you like to do?</h3>
            <button className={styles.button} onClick={() => navigate(`/learn/${selectedLanguage}`)}>Learn Words</button>
            <button className={styles.button} onClick={() => navigate(`/quiz/${selectedLanguage}`)}>Take a Quiz</button>
          </div>
        )}
        <button className={styles.button} onClick={handleLogout}>Logout</button>
        <Link className={styles.link} to="/profile">Go to Profile</Link>
      </div>
    </div>
  );
}

export default Overview;
