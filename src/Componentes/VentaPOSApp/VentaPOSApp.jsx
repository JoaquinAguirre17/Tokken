// src/Componentes/VentaPOSApp/VentaPOSApp.jsx

import React from 'react';
import { NavLink, Outlet, Routes, Route, Navigate } from 'react-router-dom';
import Venta from './Secciones/Venta';
import Productos from './Secciones/ProductManagerPOS';

import IngresoMercaderia from './Secciones/IngresoMercaderia';
import './VentaPOSApp.css';
import CierreCaja from './Secciones/Caja';
import ProductManagerPOS from './Secciones/ProductManagerPOS';

const VentaPOSApp = () => {
  return (
    <div className="venta-pos-container">
      <aside className="sidebar">
        <h2>Panel POS</h2>
        <ul>
          <li>
            <NavLink to="venta" className={({ isActive }) => (isActive ? 'activo' : '')}>Venta</NavLink>
          </li>
      
          <li>
            <NavLink to="caja" className={({ isActive }) => (isActive ? 'activo' : '')}>Caja</NavLink>
          </li>
          <li>
            <NavLink to="ingreso" className={({ isActive }) => (isActive ? 'activo' : '')}>Ingreso Mercadería</NavLink>
          </li>
          <li>
            <NavLink to="gestion" className={({ isActive }) => (isActive ? 'activo' : '')}>Gestion Productos</NavLink>
          </li>
        </ul>
      </aside>

      <main className="contenido-pos">
        <Routes>
          <Route path="/" element={<Navigate to="venta" replace />} />
          <Route path="venta" element={<Venta />} />
        
          <Route path="caja" element={<CierreCaja />} />
          <Route path="ingreso" element={<IngresoMercaderia />} />
            <Route path="gestion" element={<ProductManagerPOS />} />
        </Routes>
      </main>
    </div>
  );
};

export default VentaPOSApp;
