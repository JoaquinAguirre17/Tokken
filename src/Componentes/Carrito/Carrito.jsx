// src/Carrito/Carrito.jsx
import React, { useState } from "react";
import { useCart } from "../Contex/CartContex";
import "./Carrito.css";

// Helpers
function getImage(p) {
  if (typeof p?.image === "string" && p.image.trim() !== "") return p.image;
  if (Array.isArray(p?.images) && p.images.length) return p.images[0]?.url || p.images[0];
  return "fallback.jpg";
}

function getId(p) {
  const id = p?._id ?? p?.id ?? null;
  if (!id) return null;
  // Validar ObjectId Mongo
  return /^[0-9a-fA-F]{24}$/.test(id) ? id : null;
}

function getUnitPrice(p) {
  if (typeof p?.price === "number") return p.price;
  if (p?.pricing?.sale) return Number(p.pricing.sale);
  if (p?.pricing?.list) return Number(p.pricing.list);
  if (p?.variants?.[0]?.price) return Number(p.variants[0].price);
  return 0;
}

const Carrito = () => {
  const { cart, removeItem, increaseQty, decreaseQty, clearCart } = useCart();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((acc, p) => acc + getUnitPrice(p) * (p.count || 1), 0);

  const handleCheckout = async () => {
    if (!nombre || !email || !telefono) {
      alert("Por favor completá nombre, email y teléfono.");
      return;
    }

    // Normalizar carrito
    const items = cart
      .map(p => {
        const pid = getId(p);
        if (!pid) {
          console.warn("Producto sin ID válido:", p);
          return null;
        }
        return {
          productId: pid,
          title: p.title || "",
          qty: p.count || 1,
          price: getUnitPrice(p),
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      alert("Hay productos inválidos en el carrito. Volvé a agregarlos.");
      return;
    }

    const body = {
      customer: { 
        name: nombre, 
        email: email, 
        phone: telefono,
        shippingAddress: { line1: direccion } 
      },
      productos: items,
      total: Number(total.toFixed(2)),
      metodoPago: "mercadopago",
    };

    setLoading(true);

    try {
      const res = await fetch("https://tokkenback2.onrender.com/api/orders/web-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Respuesta del backend no es JSON:", text);
        alert("Error del servidor. Revisá consola.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Error creando la orden");

      if (data?.mpInitPoint) {
        window.location.href = data.mpInitPoint;
      } else {
        alert("Orden creada correctamente.");
      }

      clearCart();
    } catch (err) {
      console.error("Error procesando la orden:", err);
      alert("Hubo un error al procesar la orden. Revisar consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tokken-carrito-container">
      <h2 className="tokken-carrito-title">Mi Carrito</h2>

      {cart.length === 0 ? (
        <p className="tokken-carrito-empty">No hay productos en el carrito</p>
      ) : (
        <>
          <div className="tokken-carrito-items">
            {cart.map(p => {
              const id = getId(p);
              const qty = p.count || 1;
              const unit = getUnitPrice(p);
              const img = getImage(p);

              return (
                <div key={id} className="tokken-carrito-item">
                  <img src={img} alt={p.title} className="tokken-carrito-img" />
                  <div className="tokken-carrito-info">
                    <h3 className="tokken-carrito-item-title">{p.title}</h3>
                    <p className="tokken-carrito-price">Precio: ${unit.toFixed(2)}</p>
                    <p className="tokken-carrito-subtotal">
                      Subtotal: ${(unit * qty).toFixed(2)}
                    </p>
                    <div className="tokken-carrito-qty">
                      <button onClick={() => decreaseQty(id)}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => increaseQty(id)}>+</button>
                    </div>
                    <button 
                      className="tokken-carrito-remove" 
                      onClick={() => removeItem(id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tokken-checkout-form">
            <h3>Datos del Cliente</h3>
            <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
            <input placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} />

            <p className="tokken-checkout-total">Total a pagar: ${total.toFixed(2)}</p>

            <button 
              className="tokken-checkout-btn"
              onClick={handleCheckout} 
              disabled={loading}
            >
              {loading ? "Procesando..." : "Finalizar Compra"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
