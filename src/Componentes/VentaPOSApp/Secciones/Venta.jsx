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

  const [mensajeError, setMensajeError] = useState(null);
  const inputRef = useRef(null);

  const vendedores = ['Adrea', 'Joaquin', 'Facundo', 'Gonzalo', 'Alicia'];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
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

  const resultados = productos.filter(p =>
    (categoria === '' || (p.product_type && p.product_type.toLowerCase() === categoria)) &&
    p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  const puedeAgregar = (producto) => {
    const variante = producto.variants[0];
    if (!variante || variante.inventory_quantity <= 0) return false;

    const itemEnCarrito = carrito.find(p => p.id === producto.id);
    if (!itemEnCarrito) return true;
    return itemEnCarrito.cantidad < variante.inventory_quantity;
  };

  const agregarProducto = (producto) => {
    if (!puedeAgregar(producto)) {
      setMensajeError('No hay suficiente stock disponible para este producto.');
      return;
    }
    setMensajeError(null);
    const variante = producto.variants[0];
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
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
          variant_id: variante.id,
          imagen: producto.images?.[0]?.src || null,
        },
      ];
    });
  };

  const actualizarCantidad = (id, cantidad) => {
    const cantNum = parseInt(cantidad, 10);
    if (isNaN(cantNum) || cantNum < 1) return;
    setCarrito(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, cantidad: cantNum > p.stock ? p.stock : cantNum }
          : p
      )
    );
  };

  const actualizarPrecio = (id, precio) => {
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) return;
    setCarrito(prev =>
      prev.map(p => (p.id === id ? { ...p, precio: precioNum } : p))
    );
  };

  const eliminarProducto = (id) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  };

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

  const guardarVenta = (venta) => {
    const ventasPrevias = JSON.parse(localStorage.getItem('ventasPOS')) || [];
    ventasPrevias.push(venta);
    localStorage.setItem('ventasPOS', JSON.stringify(ventasPrevias));
  };

  const enviarVentaAlBackend = async (venta) => {
    const response = await fetch('https://tokkenback2.onrender.com/api/shopify/createOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al registrar la venta:', response.status, response.statusText, errorText);
      throw new Error(`Error al registrar la venta: ${response.statusText}`);
    }
    return await response.json();
  };

  const confirmarVenta = async () => {
    if (!vendedorSeleccionado) {
      setMensajeError('Seleccioná un vendedor antes de confirmar la venta.');
      return;
    }
    if (carrito.length === 0) {
      setMensajeError('Agregá al menos un producto al carrito.');
      return;
    }
    setMensajeError(null);

    const productosParaEnvio = carrito.map(p => ({
      variant_id: p.variant_id,
      quantity: p.cantidad,
      price: p.precio,
      title: p.title,
      id: p.id,
    }));

    const venta = {
      fecha: new Date().toISOString(),
      productos: productosParaEnvio,
      metodoPago,
      total: calcularTotal(),
      vendedor: vendedorSeleccionado,
      tags: ['local'],
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
      setBusqueda('');
      setCategoria('');
      inputRef.current?.focus();
    } catch (error) {
      setMensajeError('Error al registrar la venta en el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && resultados.length > 0) {
      e.preventDefault();
      agregarProducto(resultados[0]);
    }
  };

  return (
    <div className="venta-pos-app">
      <h2 className="venta-pos-titulo">Sistema de Venta</h2>

      <div className="venta-pos-selector-vendedor">
        <SelectorVendedor
          vendedores={vendedores}
          vendedorSeleccionado={vendedorSeleccionado}
          setVendedorSeleccionado={setVendedorSeleccionado}
        />
      </div>

      <div className="venta-pos-main">
        <div className="venta-pos-filtros">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            className="venta-pos-input-busqueda"
            aria-label="Buscar producto"
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="venta-pos-select-categoria"
            aria-label="Filtrar por categoría"
          >
            {CATEGORIAS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="venta-pos-contenido">
          <div className="venta-pos-productos">
            {error && <p className="venta-pos-mensaje-error">{error}</p>}
            {mensajeError && <p className="venta-pos-mensaje-error">{mensajeError}</p>}

            {loading ? (
              <p>Cargando productos...</p>
            ) : (
              <div className="venta-pos-resultados">
                {resultados.length === 0 ? (
                  <p>No se encontraron productos.</p>
                ) : (
                  resultados.map(producto => {
                    const variante = producto.variants[0];
                    const stock = variante?.inventory_quantity || 0;
                    const puedeAgregarProd = puedeAgregar(producto);
                    return (
                      <div key={producto.id} className="venta-pos-producto-card">
                        {producto.images?.[0]?.src && (
                          <img
                            src={producto.images[0].src}
                            alt={producto.title}
                            className="venta-pos-producto-imagen"
                            loading="lazy"
                          />
                        )}
                        <div className="venta-pos-producto-info">
                          <h3 className="venta-pos-producto-titulo">{producto.title}</h3>
                          <p className="venta-pos-producto-precio">
                            Precio: ${variante?.price ? Number(variante.price).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0.00'}
                          </p>
                          <p className="venta-pos-producto-stock">Stock: {stock}</p>
                          <button
                            disabled={!puedeAgregarProd}
                            onClick={() => agregarProducto(producto)}
                            className={`venta-pos-btn-agregar ${!puedeAgregarProd ? 'disabled' : ''}`}
                            aria-label={`Agregar ${producto.title} al carrito`}
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="venta-pos-carrito">
            <h3 className="venta-pos-carrito-titulo">Carrito</h3>
            {carrito.length === 0 ? (
              <p>No hay productos en el carrito.</p>
            ) : (
              <div className="venta-pos-carrito-lista">
                {carrito.map(({ id, title, precio, cantidad, stock, imagen }) => (
                  <div key={id} className="venta-pos-carrito-item">
                    {imagen && (
                      <img src={imagen} alt={title} className="venta-pos-carrito-imagen" loading="lazy" />
                    )}
                    <div className="venta-pos-carrito-detalles">
                      <p className="venta-pos-carrito-titulo">{title}</p>
                      <label>
                        Cantidad:
                        <input
                          type="number"
                          min="1"
                          max={stock}
                          value={cantidad}
                          onChange={e => actualizarCantidad(id, e.target.value)}
                          className="venta-pos-input-cantidad"
                          aria-label={`Cantidad de ${title}`}
                        />
                      </label>
                      <label>
                        Precio:
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={precio}
                          onChange={e => actualizarPrecio(id, e.target.value)}
                          className="venta-pos-input-precio"
                          aria-label={`Precio de ${title}`}
                        />
                      </label>
                      <button
                        onClick={() => eliminarProducto(id)}
                        className="venta-pos-btn-eliminar"
                        aria-label={`Eliminar ${title} del carrito`}
                      >
                         🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="venta-pos-resumen-venta">
              <p>Total: <b>${calcularTotal().toFixed(2)}</b></p>

              <label>
                Método de Pago:
                <select
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  className="venta-pos-select-metodo"
                  aria-label="Seleccionar método de pago"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </label>

              <button
                onClick={confirmarVenta}
                disabled={enviando}
                className="venta-pos-btn-confirmar"
                aria-label="Confirmar venta"
              >
                {enviando ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venta;
