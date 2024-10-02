import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Overview() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
    }

    fetch('http://127.0.0.1:5000/api/protected', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(response => response.json())
    .then(data => setData(data))
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('You are not authorized, please login.');
      navigate('/login');
    });
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        await fetch('http://127.0.0.1:5000/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    // Remove JWT token from localStorage
    localStorage.removeItem('jwtToken');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div>
      <h2>Overview Page</h2>
      <p>{data ? `Logged in as: ${data.logged_in_as.email}` : "Loading..."}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Overview;
