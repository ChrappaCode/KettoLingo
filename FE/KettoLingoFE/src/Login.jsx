import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  // Ensure content type is JSON
        body: JSON.stringify(formData),  // Send the form data as JSON
      });

      // Parse the response as JSON
      const data = await response.json();

      // Access the first element of the array which contains the actual response
      const accessToken = data[0]?.access_token;  // Extract token from the first item in the array

      if (response.ok && accessToken) {
        console.log('Login successful, JWT token:', accessToken);  // Debugging JWT token
        localStorage.setItem('jwtToken', accessToken);  // Store JWT token in localStorage
        console.log('Login successful!')
        navigate('/overview');  // Redirect to overview
      } else {
        throw new Error(data[0]?.error || 'JWT token is missing in the response.');
      }

    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>
        <p>Don&#39;t have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}

export default Login;
