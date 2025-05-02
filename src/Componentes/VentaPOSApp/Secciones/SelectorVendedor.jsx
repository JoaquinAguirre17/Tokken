// src/Componentes/SelectorVendedor.jsx
import React from 'react';
import './SelectorVendedor.css';

const SelectorVendedor = ({ vendedores, vendedorSeleccionado, setVendedorSeleccionado }) => {
  return (
    <div className="selector-vendedor">
      <label htmlFor="vendedor-select">Vendedor/a:</label>
      <select
        id="vendedor-select"
        value={vendedorSeleccionado}
        onChange={(e) => setVendedorSeleccionado(e.target.value)}
      >
        <option value="">Seleccionar vendedor</option>
        {vendedores.map((v, i) => (
          <option key={i} value={v}>
            {v}
          </option>
        ))}
        <option value="ambos">Ambos</option>
      </select>
    </div>
  );
};

export default SelectorVendedor;
