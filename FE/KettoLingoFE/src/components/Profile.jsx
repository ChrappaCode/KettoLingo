import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./profile.module.css";

function Profile() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Értesítési állapot
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
    }

    // Fetch user profile data from the backend
    fetch('http://localhost:5000/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setNotification({ message: 'Profile updated successfully!', type: 'success' }); // Siker értesítés
        } else {
          setNotification({ message: 'Failed to update profile.', type: 'error' }); // Hiba értesítés
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setNotification({ message: 'An error occurred. Please try again.', type: 'error' });
      }
    }
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  if (loading) {
    return <p className={styles["profile-loading"]}>Loading...</p>;
  }

  return (
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
            onChange={handleChange}
            className={styles["profile-input"]}
          />
          <button type="submit" className={styles["profile-button"]}>Update Profile</button>
        </form>

        <p className={styles["profile-link"]}><Link to="/overview">Go to Overview</Link></p>
      </div>
    </div>
  );
}

export default Profile;
