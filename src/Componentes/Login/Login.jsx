import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To redirect to routes
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for password
  const [message, setMessage] = useState(''); // State for error/success message
  const navigate = useNavigate(); // For navigation

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    fetch('https://papayawhip-koala-105915.hostingersite.com/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/admin'); // Or use window.location.href if you prefer
        } else {
          setMessage('Login failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Error occurred during login');
      });
  };

  return (
    <div className="login-container">
      <h2 className="login-title">INICIAR SESIÓN</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre de Usuario</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Entrar</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;
