import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./profile.module.css";
import Header from "./Header.jsx";

function Profile() {
  const [formData, setFormData] = useState({ username: '', email: '', native_language_id: 'NoChangePlaceholder' });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizDetails, setQuizDetails] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newLanguageId, setNewLanguageId] = useState('NoChangePlaceholder');
  const [displayedLanguage, setDisplayedLanguage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch available languages
    fetch('http://localhost:5000/api/languages', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setLanguages(data);
        // Fetch profile data after languages are set
        fetchProfile(token, data);
      })
      .catch(error => console.error('Error fetching languages:', error));
  }, [navigate]);

  const fetchProfile = (token, languages) => {
    fetch('http://localhost:5000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setFormData({ username: data.username, email: data.email, native_language_id: data.native_language_id || 'NoChangePlaceholder' });
        setDisplayedLanguage(languages.find(lang => lang.id === data.native_language_id)?.name || '');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
        navigate('/login');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'native_language_id') {
      setNewLanguageId(value);
      setDisplayedLanguage(languages.find(lang => lang.id === value)?.name || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newLanguageId !== 'NoChangePlaceholder' && formData.native_language_id !== newLanguageId) {
      setShowConfirmation(true);
    } else {
      await updateProfile();
    }
  };

  const updateProfile = async () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: formData.username, native_language_id: newLanguageId }),
        });

        if (response.ok) {
          setNotification({ message: 'Profile updated successfully!', type: 'success' });
          window.location.reload(); // Refresh the page
        } else {
          const errorData = await response.json();
          setNotification({ message: errorData.error || 'Failed to update profile', type: 'error' });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setNotification({ message: 'An error occurred. Please try again.', type: 'error' });
      }
    }
  };

  const handleConfirmChangeLanguage = async () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        // Delete quiz results and details
        await fetch('http://localhost:5000/api/delete_quiz_results', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Update native language
        setFormData({ ...formData, native_language_id: newLanguageId });
        setShowConfirmation(false);
        await updateProfile();
      } catch (error) {
        console.error('Error deleting quiz results:', error);
        setNotification({ message: 'An error occurred. Please try again.', type: 'error' });
      }
    }
  };

  const handleCancelChangeLanguage = () => {
    setShowConfirmation(false);
    setNewLanguageId('NoChangePlaceholder');
    setDisplayedLanguage(languages.find(lang => lang.id === formData.native_language_id)?.name || '');
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
          word: detail.word,
          is_correct: detail.is_correct ? 'Yes' : 'No'
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

  // Filter languages to exclude the native language
  const filteredLanguages = languages.filter(lang => lang.id !== formData.native_language_id);

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
            <input
              type="text"
              name="native_language"
              placeholder="Native Language"
              value={displayedLanguage}
              readOnly
              className={styles["profile-input"]}
            />
            <select
              name="native_language_id"
              value={formData.native_language_id}
              onChange={handleChange}
              className={styles["profile-select"]}
            >
              <option key="NoChangePlaceholder" value="NoChangePlaceholder">Change your native language</option>
              {filteredLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            <button type="submit" className={styles["profile-button"]}>Update Profile</button>
          </form>

          {showConfirmation && (
            <div className={styles.confirmationDialog}>
              <p>If you change your native language, the history of your quizzes will be deleted permanently. Are you sure you want to change your native language?</p>
              <button onClick={handleConfirmChangeLanguage}>Yes</button>
              <button onClick={handleCancelChangeLanguage}>No</button>
            </div>
          )}

          <div>
            <h3 className={styles.selectLanguage}>Select a Language</h3>
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
                <h4 className={styles.selectLanguage}>Categories</h4>
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
                <h4 className={styles.selectLanguage}>Quizzes Taken</h4>
                {quizzes.map(quiz => (
                  <button
                    key={quiz.id}
                    onClick={() => fetchQuizDetails(quiz.id)}
                    className={styles["quiz-button"]}
                  >
                    {quiz.date} - Score: {quiz.score}
                  </button>
                ))}
              </div>
            )}

            {quizDetails.length > 0 && (
            <div>
              <h4 className={styles.selectLanguage}>Quiz Details</h4>
              <table className={styles.quizDetailsTable}>
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {quizDetails.map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.word}</td>
                      <td>{detail.is_correct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;