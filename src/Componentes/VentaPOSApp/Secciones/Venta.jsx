import React, { useState, useEffect, useRef } from "react";
import SelectorVendedor from "./SelectorVendedor";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../Contex/AuthContext";
import "./Venta.css";

const API_BASE = "https://tokkenback2.onrender.com/api";
const API_PRODUCTS = `${API_BASE}/products`;
const API_ORDERS = `${API_BASE}/orders`;

const CATEGORIAS = [
  { value: "", label: "Todas las categorías" },
  { value: "telefonia", label: "Telefonía" },
  { value: "gamer", label: "Gamer" },
  { value: "electronica", label: "Electrónica" },
  { value: "accesorios", label: "Accesorios" }
];

function normalizeProduct(p) {

  const variant = p?.variants?.[0] || {};

  return {
    id: p?._id,
    title: p?.title || "",
    category: (p?.category || "").toLowerCase(),
    image: p?.images?.[0]?.url || "",
    price:
      Number(p?.pricing?.sale) ||
      Number(p?.pricing?.list) ||
      Number(variant?.price) ||
      0,
    stock:
      Number(variant?.stock) ||
      Number(variant?.inventory_quantity) ||
      0
  };

}

export default function Venta() {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");

  const [carrito, setCarrito] = useState([]);

  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState("");

  const [descuento, setDescuento] = useState(0);

  const [modal, setModal] = useState(false);

  const inputRef = useRef(null);

  const vendedores = ["Andrea", "Joaquin", "Thiago", "Victoria", "Gonzalo", "Alicia"];
  const { sessionId } = useAuth();
  useEffect(() => {

    const fetchProducts = async () => {

      const res = await fetch(API_PRODUCTS);
      const data = await res.json();

      const raw = Array.isArray(data) ? data : data.products || [];

      setProductos(raw.map(normalizeProduct));
      setLoading(false);

    }

    fetchProducts();

  }, []);

  const resultados = productos.filter(p =>
    (categoria === "" || p.category === categoria) &&
    p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (prod) => {

    if (prod.stock <= 0) {
      toast.error("Sin stock");
      return;
    }

    setCarrito(prev => {

      const existe = prev.find(p => p.id === prod.id);

      if (existe) {

        if (existe.cantidad >= prod.stock) {
          toast.error("Stock máximo");
          return prev;
        }

        return prev.map(p =>
          p.id === prod.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )

      }

      return [
        ...prev,
        {
          id: prod.id,
          title: prod.title,
          precio: prod.price,
          cantidad: 1,
          stock: prod.stock
        }
      ]

    })

  }

  const eliminarProducto = id => {
    setCarrito(prev => prev.filter(p => p.id !== id))
  }

  const actualizarCantidad = (id, cant) => {

    const n = parseInt(cant);

    if (isNaN(n) || n < 1) return;

    setCarrito(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, cantidad: Math.min(n, p.stock) }
          : p
      )
    )

  }

  const totalSinDesc = carrito.reduce(
    (a, p) => a + p.precio * p.cantidad,
    0
  )

  const total = totalSinDesc - (totalSinDesc * descuento) / 100;

  const confirmarVenta = async () => {

    if (!vendedorSeleccionado) {
      toast.error("Seleccioná vendedor");
      return;
    }

    if (carrito.length === 0) {
      toast.error("Carrito vacío");
      return;
    }

    const venta = {

      productos: carrito.map(p => ({
        productId: p.id,
        title: p.title,
        precio: p.precio,
        cantidad: p.cantidad
      })),

      metodoPago,
      vendedor: vendedorSeleccionado,
      total,
      descuentoPorcentaje: descuento,
      tags: ["pos"],
      fecha: new Date().toISOString(),
      sessionId 
    }

    try {

      const resp = await fetch(API_ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      })

      if (!resp.ok) throw new Error();

      toast.success("Venta registrada");

      setCarrito([]);
      setModal(false);
      setBusqueda("");

      inputRef.current?.focus();

    } catch {

      toast.error("Error registrando venta")

    }

  }
  const formatARS = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const descuentos = [0, 5, 10, 15, 20, 25, 30];

  return (

    <div className="venta-app">

      <Toaster position="top-right" />

      <div className="venta-layout">

        <div className="venta-sistema">

          <h2 className="venta-titulo">Sistema de Venta</h2>

          <SelectorVendedor
            vendedores={vendedores}
            vendedorSeleccionado={vendedorSeleccionado}
            setVendedorSeleccionado={setVendedorSeleccionado}
          />

          <div className="venta-filtros">

            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="venta-buscador"
            />

            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="venta-select-categoria"
            >

              {CATEGORIAS.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}

            </select>

          </div>

          {loading
            ? <p>Cargando...</p>
            : (

              <div className="venta-resultados">

                {resultados.map(prod => (

                  <div
                    key={prod.id}
                    className="venta-producto"
                    onClick={() => agregarProducto(prod)}
                  >

                    <img src={prod.image} alt={prod.title} />

                    <p>{prod.title}</p>

                    <b>${prod.price}</b>

                    <small>Stock {prod.stock}</small>

                  </div>

                ))}

              </div>

            )}

        </div>

        <div className="venta-carrito-container">

          <h3>Carrito</h3>

          {carrito.map(p => (

            <div key={p.id} className="venta-item-carrito">

              <p>{p.title}</p>

              <input
                type="number"
                value={p.cantidad}
                onChange={e => actualizarCantidad(p.id, e.target.value)}
              />

              <p>{formatARS(p.precio)}</p>
              <p>{formatARS(p.precio * p.cantidad)}</p>

              <button onClick={() => eliminarProducto(p.id)}>✕</button>

            </div>

          ))}

          <button onClick={() => setCarrito([])}>Vaciar carrito</button>

          <div className="venta-descuento">

            <label>Descuento</label>

            <select
              value={descuento}
              onChange={e => setDescuento(parseInt(e.target.value))}
            >

              {descuentos.map(d => (
                <option key={d} value={d}>{d}%</option>
              ))}

            </select>

          </div>

          <div className="venta-metodo-pago">

            <label>Método de Pago</label>

            <div className="venta-metodos">

              {["Efectivo", "Transferencia", "Débito", "Crédito", "QR Openpay"].map(mp => (

                <button
                  key={mp}
                  className={metodoPago === mp ? "activo" : ""}
                  onClick={() => setMetodoPago(mp)}
                >

                  {mp}

                </button>

              ))}

            </div>

          </div>

          <h2>Total {formatARS(total)}</h2>

          <button
            className="venta-confirmar"
            onClick={() => setModal(true)}
          >

            Confirmar Venta

          </button>

        </div>

      </div>

      {modal && (

        <div className="venta-modal-overlay">

          <div className="venta-modal">

            <h3>Confirmar venta</h3>

            <p>Vendedor: {vendedorSeleccionado}</p>
            <p>Método: {metodoPago}</p>
            <p>Total: {formatARS(total)}</p>

            <button onClick={() => setModal(false)}>Cancelar</button>
            <button onClick={confirmarVenta}>Confirmar</button>

          </div>

        </div>

      )}

    </div>

  );

}