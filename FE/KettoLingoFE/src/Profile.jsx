import { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';

function Profile() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);  // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
    }

    // Fetch user profile data from the backend
    fetch('http://127.0.0.1:5000/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the JWT token
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setFormData({ username: data.username, email: data.email });
        setLoading(false);  // Set loading to false when data is fetched
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
        console.log('You are not authorized, please login.');
        navigate('/login');
      });
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          console.log('Profile updated successfully!')
        } else {
          console.log('Failed to update profile.')
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  // Show a loading state until data is fetched
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Profile Page</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}  // Pre-fill username
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}  // Pre-fill email
          onChange={handleChange}
        />
        <button type="submit">Update Profile</button>
      </form>
        <p><Link to="/overview">Go to Overview</Link></p>
    </div>
  );
}

export default Profile;
