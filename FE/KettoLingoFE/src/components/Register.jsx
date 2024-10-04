import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from "./register.module.css";

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('User registered successfully:', data);
        navigate('/login');
      } else {
        console.log('Registration failed:', data);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input className={styles.input} type="text" name="username" placeholder="Username" onChange={handleChange} />
          <input className={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input className={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} />
          <button className={styles.button} type="submit">Register</button>
        </form>
        <p className={styles.link}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;
