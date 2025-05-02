// src/Componentes/GestionProductos/GestionProductos.jsx

import React, { useState, useEffect } from 'react';
import './GestionProductos.css';

// Simulamos que estos son los productos que tenemos en la base de datos
const productosEjemplo = [
  { id: 1, nombre: 'Mate Imperial', precio: 5000, stock: 10 },
  { id: 2, nombre: 'Termo Stanley', precio: 30000, stock: 5 },
  { id: 3, nombre: 'Bombilla Acero', precio: 1500, stock: 20 },
];

const GestionProductos = () => {
  const [productos, setProductos] = useState(productosEjemplo);
  const [busqueda, setBusqueda] = useState('');
  const [productoNuevo, setProductoNuevo] = useState({ nombre: '', precio: '', stock: '' });

  const filtrarProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = () => {
    if (productoNuevo.nombre && productoNuevo.precio && productoNuevo.stock) {
      const nuevoProducto = {
        id: productos.length + 1,
        nombre: productoNuevo.nombre,
        precio: parseFloat(productoNuevo.precio),
        stock: parseInt(productoNuevo.stock),
      };
      setProductos([...productos, nuevoProducto]);
      setProductoNuevo({ nombre: '', precio: '', stock: '' });
    }
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(p =>
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  return (
    <div className="gestion-productos-section">
      <div className="columna-busqueda">
        <h3>Buscar producto</h3>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
        />
        <ul>
          {filtrarProductos.map(p => (
            <li key={p.id}>
              <strong>{p.nombre}</strong> - ${p.precio} - Stock: {p.stock}
              <button onClick={() => eliminarProducto(p.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="columna-editar">
        <h3>Agregar nuevo producto</h3>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={productoNuevo.nombre}
          onChange={e => setProductoNuevo({ ...productoNuevo, nombre: e.target.value })}
        />
        <input
          type="number"
          placeholder="Precio"
          value={productoNuevo.precio}
          onChange={e => setProductoNuevo({ ...productoNuevo, precio: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={productoNuevo.stock}
          onChange={e => setProductoNuevo({ ...productoNuevo, stock: e.target.value })}
        />
        <button onClick={agregarProducto}>Agregar producto</button>
      </div>

      <div className="columna-editar">
        <h3>Editar productos</h3>
        {productos.map(p => (
          <div key={p.id} className="producto-editar">
            <strong>{p.nombre}</strong>
            <div>
              <label>Precio: </label>
              <input
                type="number"
                value={p.precio}
                onChange={e => actualizarProducto(p.id, 'precio', e.target.value)}
              />
            </div>
            <div>
              <label>Stock: </label>
              <input
                type="number"
                value={p.stock}
                onChange={e => actualizarProducto(p.id, 'stock', e.target.value)}
              />
            </div>
            <button onClick={() => eliminarProducto(p.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionProductos;
