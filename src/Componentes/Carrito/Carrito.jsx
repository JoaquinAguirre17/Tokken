import React, { useState } from 'react';
import { useCart } from '../Contex/CartContex';
import './Carrito.css';

const Carrito = () => {
  const { cart, removeItem, getTotalPrice, increaseQty, decreaseQty, clearCart } = useCart();

  const [metodoPago, setMetodoPago] = useState('none');
  const [nombreCliente, setNombreCliente] = useState('');

  const total = getTotalPrice();
  const descuento = metodoPago === 'transferencia' ? total * 0.1 : 0;
  const totalFinal = total - descuento;

  const handleWhatsApp = async () => {
    if (metodoPago === 'none') {
      alert('Por favor seleccioná un método de pago antes de enviar el pedido.');
      return;
    }

    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    const productosParaBackend = cart
      .map(p => {
        const variante = p.variants && p.variants.length > 0 ? p.variants[0] : null;
        if (!variante) {
          console.warn('Producto sin variantes, se omite:', p);
          return null;
        }
        return {
          title: p.title || 'Sin título',
          variant_id: variante.id,
          cantidad: p.count || 1,
          precio: parseFloat(variante.price) || 0,
        };
      })
      .filter(Boolean);

    if (productosParaBackend.length === 0) {
      alert('No hay productos válidos para enviar.');
      return;
    }

    const bodyToSend = {
      productos: productosParaBackend,
      metodoPago,
      vendedor: nombreCliente || 'Anónimo',
      total: totalFinal,
      tags: ['whatsapp']
    };

    console.log('Body a enviar:', bodyToSend);

    try {
      const response = await fetch('https://tokkenback2.onrender.com/api/shopify/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar la orden');
      }

      const intro = `📦 NUEVO PEDIDO desde el sitio web\n👤 Cliente: ${nombreCliente || 'No especificado'}\n\n`;

      const items = cart
        .map(
          p =>
            `• ${p.title} (x${p.count}) - $${(
              (p.variants[0]?.price || 0) * p.count
            ).toFixed(2)}`
        )
        .join('\n');

      const medioPago = `\n\n💳 Método de pago: ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}`;

      const totalTexto =
        metodoPago === 'transferencia'
          ? `\n\n💰 Subtotal: $${total.toFixed(2)}\n💸 Descuento 10%: -$${descuento.toFixed(2)}\n🧾 Total final: $${totalFinal.toFixed(2)}`
          : `\n\n🧾 Total: $${total.toFixed(2)}`;

      const linkControl = data.staff_control_url
        ? `\n\n🔗 Confirmar venta:\n${data.staff_control_url}`
        : '';

      const outro = '\n\n❓ Por favor, confirmar si se concretó la venta. ¡Gracias! 🙌';

      // Codifica el mensaje completo
      const fullMessage = encodeURIComponent(
        intro + items + medioPago + totalTexto + linkControl + outro
      );

      window.open(`https://wa.me/3515181404?text=${fullMessage}`, '_blank');

      clearCart();
      console.log('📬 Mensaje completo enviado con link:', data.staff_control_url);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Ocurrió un error al enviar el pedido. Intentalo de nuevo.');
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
                <p>Subtotal: ${(product.count * product.variants[0]?.price).toFixed(2)}</p>
                <button className="boton-carrito-eliminar" onClick={() => removeItem(product.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="carrito-nombre-cliente">
            <label>Nombre del cliente:</label>
            <input
              type="text"
              value={nombreCliente}
              onChange={e => setNombreCliente(e.target.value)}
              placeholder="Ingresá tu nombre"
            />
          </div>

          <div className="carrito-metodo-pago">
            <h4>Seleccioná el método de pago:</h4>
            <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
              <option value="none">-- Seleccioná una opción --</option>
              <option value="credito">Crédito en un pago</option>
              <option value="debito">Débito</option>
              <option value="transferencia">Transferencia bancaria (-10%)</option>
            </select>
          </div>

          <div className="carrito-total">
            {metodoPago === 'transferencia' && (
              <>
                <p>Subtotal: ${total.toFixed(2)}</p>
                <p className="carrito-descuento">Descuento 10%: -${descuento.toFixed(2)}</p>
              </>
            )}
            <p className="carrito-total-final">Total a pagar: ${totalFinal.toFixed(2)}</p>

            <button onClick={handleWhatsApp} className="btn-whatsapp" disabled={metodoPago === 'none'}>
              Enviar pedido por WhatsApp
            </button>

            <button onClick={clearCart} className="btn-clear">
              Vaciar Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
