import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./profile.module.css";
import Header from "./Header.jsx";

function Profile() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizDetails, setQuizDetails] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch profile data
    fetchProfile(token);

    // Fetch available languages
    fetch('http://localhost:5000/api/languages', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => setLanguages(data))
      .catch(error => console.error('Error fetching languages:', error));
  }, [navigate]);

  const fetchProfile = (token) => {
    fetch('http://localhost:5000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setFormData({ username: data.username, email: data.email });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
        navigate('/login');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'email') {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: formData.username }),
        });

        if (response.ok) {
          setNotification({ message: 'Profile updated successfully!', type: 'success' });
        } else {
          setNotification({ message: 'Failed to update profile.', type: 'error' });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setNotification({ message: 'An error occurred. Please try again.', type: 'error' });
      }
    }
  };

  const fetchCategories = (languageId) => {
    setSelectedLanguage(languageId);
    setSelectedCategory(null); // Reset category and quizzes
    setQuizzes([]);
    setQuizDetails([]);

    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:5000/api/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  };

  const fetchQuizzes = (categoryId) => {
    setSelectedCategory(categoryId);
    setQuizDetails([]);

    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:5000/api/quizzes?email=${formData.email}&categoryId=${categoryId}&languageId=${selectedLanguage}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => setQuizzes(data))
      .catch(error => console.error('Error fetching quizzes:', error));
  };

  const fetchQuizDetails = (quizId) => {
  const token = localStorage.getItem('jwtToken');
  fetch(`http://localhost:5000/api/quiz-details/${quizId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(data => {
      setQuizDetails(data.map((detail) => ({
        word: detail.word,  // Displayed word
        is_correct: detail.is_correct ? 'Yes' : 'No'  // Correctness as Yes or No
      })));
    })
    .catch(error => console.error('Error fetching quiz details:', error));
};

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  if (loading) {
    return <p className={styles["profile-loading"]}>Loading...</p>;
  }

  return (
    <div>
      <Header/>
      <div className={styles["profile-container"]}>
        <div className={styles["profile-card"]}>
          <h2 className={styles["profile-heading"]}>Profile Page</h2>

          {notification.message && (
            <div className={`${styles.notification} ${styles[notification.type]}`}>
              <span>{notification.message}</span>
              <button className={styles.closeBtn} onClick={closeNotification}>×</button>
            </div>
          )}

          <form className={styles["profile-form"]} onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles["profile-input"]}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              readOnly
              className={styles["profile-input"]}
            />
            <button type="submit" className={styles["profile-button"]}>Update Profile</button>
          </form>

          <div>
            <h3>Select a Language</h3>
            {languages.map(language => (
              <button
                key={language.id}
                onClick={() => fetchCategories(language.id)}
                className={styles["language-button"]}
              >
                {language.name}
              </button>
            ))}

            {selectedLanguage && (
              <div>
                <h4>Categories</h4>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => fetchQuizzes(category.id)}
                    className={styles["category-button"]}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory && (
              <div>
                <h4>Quizzes Taken</h4>
                {quizzes.map(quiz => (
                  <button
                    key={quiz.id}
                    onClick={() => fetchQuizDetails(quiz.id)}
                    className={styles["quiz-button"]}
                  >
                    {quiz.date} - Score: {quiz.score}%
                  </button>
                ))}
              </div>
            )}

            {quizDetails.length > 0 && (
              <div>
                <h4>Quiz Details</h4>
                {quizDetails.map((detail, index) => (
                  <p key={index}>
                    Word: {detail.word} - Correct: {detail.is_correct}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
