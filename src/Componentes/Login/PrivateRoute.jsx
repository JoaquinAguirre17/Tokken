import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token'); // Obtenemos el token desde localStorage

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/admin" />;
  }

  // Si hay token, permite el acceso a la ruta protegida
  return children;
};

export default PrivateRoute;
