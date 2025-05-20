import React, { useState, useEffect, useRef } from 'react';
import SelectorVendedor from './SelectorVendedor';
import './Venta.css';

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'telefonia', label: 'Telefonía' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'accesorios', label: 'Accesorios' },
];

const Venta = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const vendedores = ['Adrea', 'Joaquin', 'Facundo', 'Gonzalo', 'Alicia'];
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Obtener productos desde la API de Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://tokkenback2.onrender.com/api/shopify/products', {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
        const data = await response.json();
        setProductos(data.products);
      } catch (err) {
        setError(`Error al cargar productos. Detalles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtrar productos por categoría y búsqueda
  const resultados = productos.filter(p =>
    (categoria === '' || (p.product_type && p.product_type.toLowerCase() === categoria)) &&
    p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar producto al carrito
  const agregarProducto = (producto) => {
    const variante = producto.variants[0];
    if (!variante || variante.inventory_quantity <= 0) {
      alert('Sin stock disponible');
      return;
    }
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        if (existe.cantidad + 1 > variante.inventory_quantity) {
          alert('No hay suficiente stock');
          return prev;
        }
        return prev.map(p =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          title: producto.title,
          precio: parseFloat(variante.price),
          cantidad: 1,
          stock: variante.inventory_quantity,
          variants: producto.variants // importante para el backend
        },
      ];
    });
  };

  // Actualizar cantidad en el carrito
  const actualizarCantidad = (id, cantidad) => {
    const cantidadValida = parseInt(cantidad, 10);
    if (!isNaN(cantidadValida) && cantidadValida >= 1) {
      setCarrito(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                cantidad:
                  cantidadValida > p.stock ? p.stock : cantidadValida,
              }
            : p
        )
      );
    }
  };

  // Actualizar precio en el carrito
  const actualizarPrecio = (id, precio) => {
    const precioValido = parseFloat(precio);
    if (!isNaN(precioValido) && precioValido >= 0) {
      setCarrito(prev =>
        prev.map(p => (p.id === id ? { ...p, precio: precioValido } : p))
      );
    }
  };

  // Eliminar producto del carrito
  const eliminarProducto = (id) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  };

  // Actualizar stock localmente
  const actualizarStock = () => {
    setProductos(prev =>
      prev.map(prod => {
        const vendido = carrito.find(c => c.id === prod.id);
        if (!vendido) return prod;
        const variante = prod.variants[0];
        if (variante) {
          return {
            ...prod,
            variants: [
              {
                ...variante,
                inventory_quantity: variante.inventory_quantity - vendido.cantidad,
              },
            ],
          };
        }
        return prod;
      })
    );
  };

  // Guardar la venta en localStorage
  const guardarVenta = (venta) => {
    const ventasPrevias = JSON.parse(localStorage.getItem('ventasPOS')) || [];
    ventasPrevias.push(venta);
    localStorage.setItem('ventasPOS', JSON.stringify(ventasPrevias));
  };

  // Enviar venta al backend (ruta POS)
  const enviarVentaAlBackend = async (venta) => {
    const response = await fetch('https://tokkenback2.onrender.com/api/shopify/ventas-pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta),
    });
    if (!response.ok) throw new Error('Error al registrar la venta en el servidor');
    return await response.json();
  };

  // Confirmar venta
  const confirmarVenta = async () => {
    if (!vendedorSeleccionado) {
      alert('Por favor seleccioná un vendedor antes de confirmar la venta.');
      return;
    }
    if (carrito.length === 0) {
      alert('Agrega al menos un producto.');
      return;
    }
    const venta = {
      fecha: new Date().toISOString(),
      productos: carrito,
      metodoPago,
      total: calcularTotal(),
      vendedor: vendedorSeleccionado,
    };
    setEnviando(true);
    try {
      await enviarVentaAlBackend(venta);
      guardarVenta(venta);
      actualizarStock();
      alert('Venta registrada con éxito');
      setCarrito([]);
      setVendedorSeleccionado('');
      setMetodoPago('efectivo');
    } catch (error) {
      alert('Error al registrar la venta en el servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="venta-section">
      <div className="columna-busqueda">
        <h3>Buscar producto</h3>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          style={{ marginBottom: 8 }}
        >
          {CATEGORIAS.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
        />
        {loading && <p>Cargando productos...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && resultados.slice(0, 30).map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>${p.variants[0]?.price}</td>
                <td>{p.variants[0]?.inventory_quantity ?? '-'}</td>
                <td>
                  <button onClick={() => agregarProducto(p)}>Agregar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resultados.length > 30 && <p>Mostrando los primeros 30 resultados...</p>}
      </div>

      <div className="columna-venta">
        <h3>Carrito</h3>
        <SelectorVendedor
          vendedores={vendedores}
          vendedorSeleccionado={vendedorSeleccionado}
          setVendedorSeleccionado={setVendedorSeleccionado}
        />

        {carrito.length === 0 && (
          <div className="carrito-vacio">
            <span>🛒</span>
            <p>No hay productos agregados.</p>
          </div>
        )}

        <div className="carrito-lista">
          {carrito.map(p => (
            <div key={p.id} className="item-producto tarjeta-carrito">
              <div className="producto-header">
                <div className="producto-nombre">{p.title}</div>
                <button className="btnn-eliminar" onClick={() => eliminarProducto(p.id)}>🗑️</button>
              </div>
              <div className="producto-detalles">
                <label>
                  <span>Cantidad:</span>
                  <input
                    type="number"
                    min="1"
                    max={p.stock}
                    value={p.cantidad}
                    onChange={e => actualizarCantidad(p.id, e.target.value)}
                  />
                </label>
                <label>
                  <span>Precio:</span>
                  <input
                    type="number"
                    min="0"
                    value={p.precio}
                    onChange={e => actualizarPrecio(p.id, e.target.value)}
                  />
                </label>
                <div className="producto-total">
                  Subtotal: <b>${(p.precio * p.cantidad).toFixed(2)}</b>
                </div>
              </div>
            </div>
          ))}
        </div>

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

        <button className="btn-confirmar" onClick={confirmarVenta} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Confirmar venta'}
        </button>
      </div>
    </div>
  );
};

export default Venta;