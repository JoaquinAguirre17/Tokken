// src/Componentes/VentaPOSApp/VentaPOSApp.jsx

import React, { useState } from 'react';
import Venta from './Secciones/Venta';
import Productos from './Secciones/GestionProductos';
import Caja from './Secciones/Caja';
import IngresoMercaderia from './Secciones/IngresoMercaderia';
import './VentaPOSApp.css';

const VentaPOSApp = () => {
  const [seccionActiva, setSeccionActiva] = useState('venta');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'venta':
        return <Venta />;
      case 'productos':
        return <Productos />;
      case 'caja':
        return <Caja />;
      case 'ingreso':
        return <IngresoMercaderia />;
      default:
        return <Venta />;
    }
  };

  return (
    <div className="venta-pos-container">
      <aside className="sidebar">
        <h2>Panel POS</h2>
        <ul>
          <li onClick={() => setSeccionActiva('venta')} className={seccionActiva === 'venta' ? 'activo' : ''}>
            Venta
          </li>
          <li onClick={() => setSeccionActiva('productos')} className={seccionActiva === 'productos' ? 'activo' : ''}>
            Productos
          </li>
          <li onClick={() => setSeccionActiva('caja')} className={seccionActiva === 'caja' ? 'activo' : ''}>
            Caja
          </li>
          <li onClick={() => setSeccionActiva('ingreso')} className={seccionActiva === 'ingreso' ? 'activo' : ''}>
            Ingreso Mercadería
          </li>
        </ul>
      </aside>
      <main className="contenido-pos">
        {renderSeccion()}
      </main>
    </div>
  );
};

export default VentaPOSApp;
