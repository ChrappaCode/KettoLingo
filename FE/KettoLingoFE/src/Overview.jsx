import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Overview() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');  // If no token, redirect to login
    }

    // Fetch protected data with JWT token
    fetch('http://127.0.0.1:5000/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the JWT token
        'Content-Type': 'application/json'
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
      console.error('Error fetching data:', error);
      console.log('You are not authorized, please login.')
      navigate('/login');
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  return (
    <div>
      <h2>Overview Page</h2>
      <p>{data ? `Logged in as: ${data.logged_in_as.email}` : "Loading..."}</p>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/profile">Go to Profile</Link>  {/* Link to Profile */}
    </div>
  );
}

export default Overview;
