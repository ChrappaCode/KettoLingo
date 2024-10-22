import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./login.module.css";

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      const accessToken = data[0]?.access_token;

      if (response.ok && accessToken) {
        localStorage.setItem('jwtToken', accessToken);
        navigate('/overview');
      } else {
        throw new Error(data[0]?.error || 'JWT token is missing in the response.');
      }

    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>KettőLingo</h1>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className={styles.input}
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            className={styles.input}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" className={styles.button}>Login</button>
        </form>
        <p className={styles.link}>
          Don&#39;t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
