import React, { useState, useEffect, useRef } from "react";
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
  const [cuotas, setCuotas] = useState(1);
  const [descuento, setDescuento] = useState(0);

  const [modal, setModal] = useState(false);

  const inputRef = useRef(null);

  const { sessionId, user } = useAuth();

  const vendedor = user?.name || user?.username || "Desconocido";

  /* =========================
     CARGA PRODUCTOS
  ========================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_PRODUCTS);
        const data = await res.json();

        const raw = Array.isArray(data) ? data : data.products || [];

        setProductos(raw.map(normalizeProduct));
      } catch (error) {
        console.error("Error productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* =========================
     FILTRO PRODUCTOS
  ========================= */
  const resultados = productos.filter(
    (p) =>
      (categoria === "" || p.category === categoria) &&
      p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  /* =========================
     AGREGAR PRODUCTO
  ========================= */
  const agregarProducto = (prod) => {
    if (prod.stock <= 0) return toast.error("Sin stock");

    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === prod.id);

      if (existe) {
        if (existe.cantidad >= prod.stock) {
          toast.error("Stock máximo");
          return prev;
        }

        return prev.map((p) =>
          p.id === prod.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
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
      ];
    });
  };

  /* =========================
     ELIMINAR
  ========================= */
  const eliminarProducto = (id) =>
    setCarrito((prev) => prev.filter((p) => p.id !== id));

  /* =========================
     ACTUALIZAR CANTIDAD
  ========================= */
  const actualizarCantidad = (id, cant) => {
    const n = parseInt(cant);
    if (isNaN(n) || n < 1) return;

    setCarrito((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, cantidad: Math.min(n, p.stock) }
          : p
      )
    );
  };

  /* =========================
     TOTALES
  ========================= */
const totalSinDesc = carrito.reduce(
  (a, p) => a + p.precio * p.cantidad,
  0
);

const subtotal =
  totalSinDesc -
  (totalSinDesc * descuento) / 100;

  let porcentajeRecargo = 0;

  if (metodoPago === "Crédito") {

    if (cuotas === 3) {
      porcentajeRecargo = 10;
    }

    if (cuotas === 6) {
      porcentajeRecargo = 20;
    }

  }

  const total =
    subtotal +
    (subtotal * porcentajeRecargo / 100);
  /* =========================
     CONFIRMAR VENTA
  ========================= */
  const confirmarVenta = async () => {
    if (carrito.length === 0)
      return toast.error("Carrito vacío");

    const venta = {
      productos: carrito.map((p) => ({
        productId: p.id,
        title: p.title,
        precio: p.precio,
        cantidad: p.cantidad
      })),
      metodoPago,
      cuotas,
      vendedor,
      total,
      descuentoPorcentaje: descuento,
      tags: ["pos"],
      fecha: new Date().toISOString(),
      sessionId
    };

    try {
      const resp = await fetch(API_ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });

      if (!resp.ok) throw new Error();

      toast.success("Venta registrada");

      setCarrito([]);
      setModal(false);
      setBusqueda("");

      inputRef.current?.focus();
    } catch {
      toast.error("Error registrando venta");
    }
  };

  /* =========================
     FORMATO MONEDA
  ========================= */
  const formatARS = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(value);

  const descuentos = [0, 5, 10, 15, 20, 25, 30];

  return (
    <div className="venta-app">
      <Toaster position="top-right" />

      <div className="venta-layout">

        {/* =========================
          PANEL IZQUIERDO (PRODUCTOS)
      ========================= */}
        <div className="venta-sistema">
          <h2 className="venta-title">Sistema de Venta</h2>

          <div className="venta-filtros">
            <input
              ref={inputRef}
              className="venta-input"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              className="venta-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="venta-loading">Cargando...</p>
          ) : (
            <div className="venta-resultados">
              {resultados.map((p) => (
                <div
                  key={p.id}
                  className="venta-producto"
                  onClick={() => agregarProducto(p)}
                >
                  <img src={p.image} className="venta-producto-img" />
                  <div className="venta-producto-info">
                    <p>{p.title}</p>
                    <b>{formatARS(p.price)}</b>
                    <small className="venta-producto-stock">  Stock {p.stock}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================
          PANEL DERECHO (CARRITO)
      ========================= */}
        <div className="venta-carrito-container">
          <h3 className="venta-carrito-title">🛒 Carrito</h3>

          <div className="venta-carrito-header">
            <span>Producto</span>
            <span>Cant.</span>
            <span>Total</span>
          </div>

          <div className="venta-carrito-lista">
            {carrito.map((p) => (
              <div key={p.id} className="venta-carrito-item">

                <div className="venta-carrito-nombre">
                  {p.title}
                </div>

                <input
                  className="venta-carrito-cantidad"
                  type="number"
                  value={p.cantidad}
                  onChange={(e) =>
                    actualizarCantidad(p.id, e.target.value)
                  }
                />

                <div className="venta-carrito-total">
                  {formatARS(p.precio * p.cantidad)}
                </div>

                <button
                  className="venta-carrito-delete"
                  onClick={() => eliminarProducto(p.id)}
                >
                  ✕
                </button>

              </div>
            ))}
          </div>

          <div className="venta-carrito-footer">
            <button
              className="venta-btn-vaciar"
              onClick={() => setCarrito([])}
            >
              Vaciar carrito
            </button>

            <div className="venta-carrito-total-general">
              Total: {formatARS(total)}
            </div>
          </div>

          <select
            className="venta-descuento"
            value={descuento}
            onChange={(e) => setDescuento(Number(e.target.value))}
          >
            {descuentos.map((d) => (
              <option key={d} value={d}>
                {d}% descuento
              </option>
            ))}
          </select>

          {/* =========================
            MÉTODOS DE PAGO
        ========================= */}
          <div className="metodos-pago">
            <p className="metodos-title">Método de pago</p>

            <div className="metodos-grid">
              {["Efectivo", "Transferencia", "Débito", "Crédito", "QR Openpay"].map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => {

                      setMetodoPago(m);

                      if (m !== "Crédito") {
                        setCuotas(1);
                      }

                    }}
                    className={
                      `metodo-btn ${metodoPago === m
                        ? "activo"
                        : ""
                      }`
                    }
                  >
                    {m}
                  </button>
                )
              )}
            </div>
          </div>
          {metodoPago === "Crédito" && (

            <div className="venta-cuotas">

              <label>
                Cuotas
              </label>

              <select
                className="venta-select"
                value={cuotas}
                onChange={(e) =>
                  setCuotas(Number(e.target.value))
                }
              >
                <option value={1}>
                  1 cuota (sin recargo)
                </option>

                <option value={3}>
                  3 cuotas (+10%)
                </option>

                <option value={6}>
                  6 cuotas (+20%)
                </option>
              </select>

            </div>

          )}
          <div className="venta-total">

            <h2>
              Total: {formatARS(total)}
            </h2>

            {metodoPago === "Crédito" && (
              <small>
                Recargo aplicado:
                {" "}
                {porcentajeRecargo}%
              </small>
            )}

          </div>

          <button
            className="venta-btn-confirmar"
            onClick={() => setModal(true)}
          >
            Confirmar Venta
          </button>
        </div>
      </div>

      {/* =========================
        MODAL PROFESIONAL
    ========================= */}
      {
        modal && (
          <div className="venta-modal-overlay">
            <div className="venta-modal">

              <h3>Confirmar venta</h3>

              <div className="venta-modal-info">
                <p><b>Vendedor:</b> {vendedor}</p>
                <p><b>Total:</b> {formatARS(total)}</p>
              </div>

              <div className="venta-modal-actions">
                <button
                  className="venta-btn-cancelar"
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="venta-btn-confirmar-modal"
                  onClick={confirmarVenta}
                >
                  Confirmar
                </button>
              </div>

            </div>
          </div>
        )
      }
    </div >
  );

}