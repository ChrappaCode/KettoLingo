import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./overview.module.css";
import Header from './Header.jsx';

function Overview() {
  const [data, setData] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [foreignLanguage, setForeignLanguage] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const textToDisplay = 'What would you like to do?';

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProtectedData = fetch('http://localhost:5000/api/protected', {
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
      .then(data => {
        setData(data);
        // Fetch all languages and set them in the state
        fetch('http://localhost:5000/api/languages_dropdown', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(languages => {
            if (languages.length === 0) {
              setError('No languages available.');
            }
            setLanguages(languages);
          })
          .catch(error => {
            console.error('Error fetching languages:', error);
            setError('Failed to load languages.');
          });
      })
      .catch(error => {
        console.error('Error fetching protected data:', error);
        setError('Failed to load user data.');
        navigate('/login');
      });

    const fetchCategories = fetch('http://localhost:5000/api/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(categories => {
        if (categories.length === 0) {
          setError('No categories available.');
        }
        setCategories(categories);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories.');
      });

    Promise.all([fetchProtectedData, fetchCategories]).then(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (foreignLanguage && selectedCategory) {
      const timer = setInterval(() => {
        if (currentIndex < textToDisplay.length) {
          setDisplayText((prev) => prev + textToDisplay[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        } else {
          clearInterval(timer);
        }
      }, 100);

      return () => clearInterval(timer);
    } else {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [foreignLanguage, selectedCategory, currentIndex]);

  const handleForeignLanguageChange = (e) => {
    setForeignLanguage(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleStartLearning = () => {
    if (data && data.native_language && foreignLanguage && selectedCategory) {
      navigate(`/learn/${foreignLanguage}/${selectedCategory}`);
    }
  };

  const handleStartQuiz = () => {
    if (data && data.native_language && foreignLanguage && selectedCategory) {
      navigate(`/quiz/${foreignLanguage}/${selectedCategory}`);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Overview Page</h2>
          <p className={styles.subtitle}>
            {data ? (
              <>
                Logged in as: <strong className={styles.email}>{data.logged_in_as.email}</strong>
              </>
            ) : (
              "Loading..."
            )}
          </p>

          <div>
            <label className={styles.label_select}>Select a Foreign Language to Learn: </label>
            <br/>
            <select className={styles.select} value={foreignLanguage} onChange={handleForeignLanguageChange}>
              <option value="" disabled>Select a foreign language</option>
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
          <div>
            <label className={styles.label_select}>Select a Category: </label>
            <br/>
            <select className={styles.select} value={selectedCategory} onChange={handleCategoryChange}>
              <option value="" disabled>Select a category</option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          {foreignLanguage && selectedCategory && (
            <div>
              <h3>{displayText}</h3>
              <button className={styles.button} onClick={handleStartLearning}>
                Learn Words
              </button>
              <button className={styles.button} onClick={handleStartQuiz}>
                Take a Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;