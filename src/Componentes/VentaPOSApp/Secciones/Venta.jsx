import React, { useState } from 'react';
import './Venta.css';
import SelectorVendedor from './SelectorVendedor';

const productosEjemplo = [
  { id: 1, nombre: 'Mate Imperial', precio: 5000 },
  { id: 2, nombre: 'Termo Stanley', precio: 30000 },
  { id: 3, nombre: 'Bombilla Acero', precio: 1500 },
];

const Venta = () => {
  const [busqueda, setBusqueda] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState('');
  const vendedores = ['Ana', 'Luis', 'Marcela'];

  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p.id === producto.id);
    if (!existe) {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { ...producto, cantidad: 1 },
      ]);
    }
  };

  const actualizarCantidad = (id, cantidad) => {
    const cantidadValida = parseInt(cantidad, 10);
    if (!isNaN(cantidadValida) && cantidadValida >= 1) {
      setProductosSeleccionados(prev =>
        prev.map(p => (p.id === id ? { ...p, cantidad: cantidadValida } : p))
      );
    }
  };

  const actualizarPrecio = (id, precio) => {
    const precioValido = parseFloat(precio);
    if (!isNaN(precioValido) && precioValido >= 0) {
      setProductosSeleccionados(prev =>
        prev.map(p => (p.id === id ? { ...p, precio: precioValido } : p))
      );
    }
  };

  const eliminarProducto = (id) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  };

  const confirmarVenta = () => {
    if (!vendedorSeleccionado) {
      alert('Por favor seleccioná un vendedor antes de confirmar la venta.');
      return;
    }

    const venta = {
      productos: productosSeleccionados,
      metodoPago,
      total: calcularTotal(),
      vendedor: vendedorSeleccionado,
    };

    console.log('Venta confirmada:', venta);
    alert('Venta registrada con éxito');
    setProductosSeleccionados([]);
    setVendedorSeleccionado('');
  };

  const resultados = productosEjemplo.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="venta-section">
      <div className="columna-busqueda">
        <h3>Buscar producto</h3>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
        />
        <ul className="lista-resultados">
          {resultados.map(p => (
            <li key={p.id} onClick={() => agregarProducto(p)}>
              {p.nombre} - ${p.precio}
            </li>
          ))}
        </ul>

        <h4 className="mt-4">Destacados</h4>
        <div className="destacados">
          {productosEjemplo.map(p => (
            <button key={p.id} onClick={() => agregarProducto(p)}>
              ⭐ {p.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="columna-venta">
        <h3>Productos seleccionados</h3>

        {/* Selector de vendedor */}
        <SelectorVendedor
          vendedores={vendedores}
          vendedorSeleccionado={vendedorSeleccionado}
          setVendedorSeleccionado={setVendedorSeleccionado}
        />

        {productosSeleccionados.length === 0 && <p>No hay productos agregados.</p>}

        {productosSeleccionados.map(p => (
          <div key={p.id} className="item-producto">
            <div className="producto-header">
              <div className="producto-nombre">{p.nombre}</div>
              <button className="btn-eliminar" onClick={() => eliminarProducto(p.id)}>🗑️</button>
            </div>
            <div className="producto-detalles">
              <label>
                Cantidad:
                <input
                  type="number"
                  min="1"
                  value={p.cantidad}
                  onChange={e => actualizarCantidad(p.id, e.target.value)}
                />
              </label>
              <label>
                Precio:
                <input
                  type="number"
                  min="0"
                  value={p.precio}
                  onChange={e => actualizarPrecio(p.id, e.target.value)}
                />
              </label>
              <div className="producto-total">
                Subtotal: ${p.precio * p.cantidad}
              </div>
            </div>
          </div>
        ))}

        <div className="metodo-pago">
          <h4>Método de pago</h4>
          <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">QR / Transferencia</option>
          </select>
        </div>

        <div className="total">
          <h4>Total: ${calcularTotal()}</h4>
        </div>

        <button className="btn-confirmar" onClick={confirmarVenta}>
          Confirmar venta
        </button>
      </div>
    </div>
  );
};

export default Venta;
