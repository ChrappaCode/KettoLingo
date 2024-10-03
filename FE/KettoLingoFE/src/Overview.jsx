import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Overview() {
  const [data, setData] = useState(null);
  const [languages, setLanguages] = useState([]);  // Holds available languages
  const [nativeLanguage, setNativeLanguage] = useState('');  // Native language selection
  const [foreignLanguage, setForeignLanguage] = useState('');  // Foreign language selection
  const [categories, setCategories] = useState([]);  // Holds categories
  const [selectedCategory, setSelectedCategory] = useState('');  // Selected category
  const [isLoading, setIsLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');  // Redirect to login if no token
    }

    const fetchProtectedData = fetch('http://127.0.0.1:5000/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Include JWT token
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
        setError('Failed to load user data.');
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
        if (languages.length === 0) {
          setError('No languages available.');
        }
        setLanguages(languages);
      })
      .catch(error => {
        console.error('Error fetching languages:', error);
        setError('Failed to load languages.');
      });

    const fetchCategories = fetch('http://127.0.0.1:5000/api/categories', {
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

    // Wait for both fetches to finish before setting isLoading to false
    Promise.all([fetchProtectedData, fetchLanguages, fetchCategories]).then(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleNativeLanguageChange = (e) => {
    setNativeLanguage(e.target.value);  // Set native language
  };

  const handleForeignLanguageChange = (e) => {
    setForeignLanguage(e.target.value);  // Set foreign language
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);  // Set selected category
  };

  const handleStartLearning = () => {
    // Log the selected language IDs and category before navigating
    console.log("Native Language ID: ", nativeLanguage);
    console.log("Foreign Language ID: ", foreignLanguage);
    console.log("Category ID: ", selectedCategory);

    if (nativeLanguage && foreignLanguage && selectedCategory) {
      navigate(`/learn/${nativeLanguage}/${foreignLanguage}/${selectedCategory}`);
    }
  };

  // Display loading while data is being fetched
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Display error if there was a problem with fetching data
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Overview Page</h2>
      <p>{data ? `Logged in as: ${data.logged_in_as.email}` : "Loading..."}</p>

      {/* Native Language Selection */}
      <div>
        <label>Select Your Native Language: </label>
        <select value={nativeLanguage} onChange={handleNativeLanguageChange}>
          <option value="" disabled>Select a native language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>  {/* Use lang.id for value */}
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Foreign Language Selection */}
      <div>
        <label>Select a Foreign Language to Learn: </label>
        <select value={foreignLanguage} onChange={handleForeignLanguageChange}>
          <option value="" disabled>Select a foreign language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>  {/* Use lang.id for value */}
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Selection */}
      <div>
        <label>Select a Category: </label>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Learn or Quiz Options */}
      {nativeLanguage && foreignLanguage && selectedCategory && (
        <div>
          <h3>What would you like to do?</h3>
          <button onClick={handleStartLearning}>Learn Words</button>
          <button onClick={() => navigate(`/quiz/${nativeLanguage}/${foreignLanguage}/${selectedCategory}`)}>Take a Quiz</button>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
      <Link to="/profile">Go to Profile</Link>
    </div>
  );
}

export default Overview;
