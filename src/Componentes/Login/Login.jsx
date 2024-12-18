import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir a rutas
import axios from 'axios'; // Para las peticiones HTTP
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inicializa useNavigate para redirigir después del login

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Solicitud POST para obtener el token con la API
      const response = await axios.post('https://appencuentro.pagliardini.com/wp-json/jwt-auth/v1/token', {
        username: username,
        password: password,
      });

      if (response.data.token) {
        // Si obtenemos el token, lo guardamos en el localStorage
        const token = response.data.token;
        localStorage.setItem('jwt_token', token); // Guardamos el token

        // Mensaje de éxito y redirigimos a la página protegida
        setMessage('Login exitoso!');
        navigate('/admin'); // Redirige al área protegida
      }
    } catch (error) {
      setMessage('Error: Usuario o contraseña incorrectos.');
      console.error(error);
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
