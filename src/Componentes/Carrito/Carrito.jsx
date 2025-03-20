import React from 'react';
import { useCart } from '../Contex/CartContex';
import './Carrito.css'

const Carrito = () => {
  const { cart, removeItem, getTotalPrice } = useCart();

  return (
    <div className="carrito-container">
      <h2>Mi Carrito</h2>
      
      {cart.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <div>
          {cart.map(product => (
            <div key={product.id} className="carrito-item">
              <h3>{product.title}</h3>
              <p>Precio: ${product.variants[0]?.price}</p>
              <p>Cantidad: {product.count}</p>
              <button onClick={() => removeItem(product.id)}>Eliminar</button>
            </div>
          ))}
          <div className="carrito-total">
            <p>Total: ${getTotalPrice()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
