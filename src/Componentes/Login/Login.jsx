import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://papayawhip-koala-105915.hostingersite.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/admin'); // Redirigir al panel de administración
      } else {
        setMessage(`Error: ${data.message || 'Credenciales incorrectas'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Hubo un error al intentar iniciar sesión.');
    }
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
