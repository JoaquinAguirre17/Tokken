import React, { useState } from 'react';
import { useCart } from '../Contex/CartContex';
import './Carrito.css';

const Carrito = () => {
  const { cart, removeItem, getTotalPrice, increaseQty, decreaseQty, clearCart } = useCart();

  // Estado del método de pago
  const [metodoPago, setMetodoPago] = useState('none');

  // Cálculo de totales
  const total = getTotalPrice();
  const descuento = metodoPago === 'transferencia' ? total * 0.1 : 0;
  const totalFinal = total - descuento;

  // Enviar pedido por WhatsApp
  const handleWhatsApp = async () => {
    if (metodoPago === 'none') {
      alert('Por favor seleccioná un método de pago antes de enviar el pedido.');
      return;
    }
  
    try {
      const response = await fetch('https://tokkenback2.onrender.com/api/shopify/draft-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cart,
          customerNote: 'Pedido desde WhatsApp',
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar la orden');
      }
  
      // Contenido del mensaje
      const intro = "📦 NUEVO PEDIDO desde el sitio web\n\n";
      const items = cart.map(p => `• ${p.title} (x${p.count})`).join('\n');
      const medioPago = `\n\n💳 Método de pago: ${metodoPago.toUpperCase()}`;
      const totalTexto = metodoPago === 'transferencia'
        ? `\n\nSubtotal: $${total.toFixed(2)}\nDescuento 10%: -$${descuento.toFixed(2)}\n💰 Total final: $${totalFinal.toFixed(2)}`
        : `\n\n💰 Total: $${total.toFixed(2)}`;
      const linkControl = `\n\n🧾 Confirmar venta:\n${data.staff_control_url}`;
      const outro = "\n\nPor favor confirmar si se concretó la venta.";
  
      const fullMessage = encodeURIComponent(
        intro + items + medioPago + totalTexto + linkControl + outro
      );
  
      // ✅ Solo se envía a un número (el del local/staff)
      window.open(`https://wa.me/3515181404?text=${fullMessage}`, '_blank');
  
      console.log("📬 Mensaje completo enviado con link:", data.staff_control_url);
  
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Ocurrió un error al enviar el pedido. Intentalo de nuevo.");
    }
  };
  
  

  return (
    <div className="carrito-container">
      <h2>Mi Carrito</h2>

      {cart.length === 0 ? (
        <p className="carrito-vacio">No hay productos en el carrito</p>
      ) : (
        <div className="carrito-contenido">
          {cart.map(product => (
            <div key={product.id} className="carrito-item">
              {product.image && (
                <img
                  src={product.image?.src || product.images?.[0]?.src || 'fallback.jpg'}
                  alt={product.title}
                  className="carrito-img"
                />
              )}
              <div className="carrito-details">
                <h3>{product.title}</h3>
                <p>Precio: ${product.variants[0]?.price}</p>
                <div className="cantidad-control">
                  <button onClick={() => decreaseQty(product.id)}>-</button>
                  <span>{product.count}</span>
                  <button onClick={() => increaseQty(product.id)}>+</button>
                </div>
                <p>Subtotal: ${product.count * product.variants[0]?.price}</p>
                <button className="boton-carrito-eliminar" onClick={() => removeItem(product.id)}>Eliminar</button>
              </div>
            </div>
          ))}

          {/* Método de pago */}
          <div className="carrito-metodo-pago">
            <h4>Seleccioná el método de pago:</h4>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="none">-- Seleccioná una opción --</option>
              <option value="credito">Crédito en un pago</option>
              <option value="debito">Débito</option>
              <option value="transferencia">Transferencia bancaria (-10%)</option>
            </select>
          </div>

          {/* Totales */}
          <div className="carrito-total">
            {metodoPago === 'transferencia' && (
              <>
                <p>Subtotal: ${total.toFixed(2)}</p>
                <p className="carrito-descuento">Descuento 10%: -${descuento.toFixed(2)}</p>
              </>
            )}
            <p className="carrito-total-final">Total a pagar: ${totalFinal.toFixed(2)}</p>

            <button
              onClick={handleWhatsApp}
              className="btn-whatsapp"
              disabled={metodoPago === 'none'}
            >
              Enviar pedido por WhatsApp
            </button>

            <button onClick={clearCart} className="btn-clear">Vaciar Carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
