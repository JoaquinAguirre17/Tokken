import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../Contex/CartContex';
import ReactLoading from 'react-loading';
import './DetalleProducto.css';
import BotonComponente from '../Boton/BotonComponente';

const DetalleProducto = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // Estado para manejar la cantidad seleccionada

  const { addItem } = useCart();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://tokkenbackshopify.onrender.com/api/shopify/products/${id}`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(`Error al cargar el producto. Detalles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="orange" height={100} width={100} />
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!product) {
    return (
      <div className="no-product-message">
        <p>No se encontró el producto.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product || !product.id) {
      console.error("Error: El producto no tiene un ID válido.");
      return;
    }
    addItem(product, quantity); // Agrega la cantidad seleccionada al carrito
    alert(`Se añadieron ${quantity} unidades de "${product.title}" al carrito.`);
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(product.variants[0]?.inventory_quantity || 1, parseInt(e.target.value)));
    setQuantity(value);
  };

  return (
    <div className="detalle-producto-container">
      <h2 className="detalle-producto-title">{product.title}</h2>

      <div className="detalle-producto-content">
        <div className="detalle-producto-image">
          <img
            src={product.images?.length > 0 ? product.images[0].src : ''}
            alt={product.title}
            className="detalle-producto-img"
          />
        </div>

        <div className="detalle-producto-info">
          <p className="detalle-producto-description">
            {product.body_html ? product.body_html.replace(/<\/?[^>]+(>|$)/g, "") : 'No hay descripción disponible'}
          </p>

          <div className="detalle-producto-price">
            <span className="price">${product.variants[0]?.price}</span>
            {product.variants[0]?.compare_at_price && (
              <span className="old-price">
                <del>${product.variants[0]?.compare_at_price}</del>
              </span>
            )}
            <p className="product-stock">
              {product.variants[0]?.inventory_quantity !== undefined
                ? product.variants[0]?.inventory_quantity > 0
                  ? `Stock disponible: ${product.variants[0].inventory_quantity}`
                  : "Sin stock"
                : "Stock no disponible"}
            </p>
          </div>

          {/* Selector de cantidad */}
          <div className="quantity-selector">
            <label htmlFor="quantity">Cantidad:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              min="1"
              max={product.variants[0]?.inventory_quantity}
              onChange={handleQuantityChange}
            />
          </div>

          <BotonComponente nombre="Añadir al carrito" onClick={handleAddToCart} />
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
