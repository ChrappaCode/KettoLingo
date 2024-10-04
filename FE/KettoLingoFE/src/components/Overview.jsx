import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from "./overview.module.css";
function Overview() {
  const [data, setData] = useState(null);
  const [languages, setLanguages] = useState([]);  // Initialize as an empty array
  const [selectedLanguage, setSelectedLanguage] = useState('');  // State to hold selected language
  const [isLoading, setIsLoading] = useState(true);  // State to handle loading
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');  // If no token, redirect to login
    }

    // Fetch protected data with JWT token
    const fetchProtectedData = fetch('http://127.0.0.1:5000/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the JWT token
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

    // Fetch available languages from the backend
    const fetchLanguages = fetch('http://127.0.0.1:5000/api/languages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(languages => {
      // Ensure the response is an array before setting it
      if (Array.isArray(languages)) {
        setLanguages(languages);
      } else {
        setLanguages([]);  // Default to an empty array if response is not an array
      }
    })
    .catch(error => {
      console.error('Error fetching languages:', error);
      setLanguages([]);  // Ensure languages is an empty array on error
    });

    // Wait for both fetch requests to finish before setting loading state to false
    Promise.all([fetchProtectedData, fetchLanguages]).then(() => setIsLoading(false));

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);  // Update selected language
  };

  // Display loading state while data is being fetched
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Overview Page</h2>
      <p>{data ? `Logged in as: ${data.logged_in_as.email}` : "Loading..."}</p>

      <div>
        <label>Select a Language: </label>
        <select value={selectedLanguage} onChange={handleLanguageChange}>
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
          <button onClick={() => navigate(`/learn/${selectedLanguage}`)}>Learn Words</button>
          <button onClick={() => navigate(`/quiz/${selectedLanguage}`)}>Take a Quiz</button>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
      <Link to="/profile">Go to Profile</Link>
    </div>
  );
}

export default Overview;
