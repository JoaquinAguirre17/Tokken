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
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://tokkenback2.onrender.com/api/shopify/products/${id}`, {
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

  const handleAddToCart = () => {
    if (!product || !product.id) {
      console.error("Error: El producto no tiene un ID válido.");
      return;
    }

    const variant = product?.variants?.[0];
    const stock = variant?.inventory_quantity || 0;

    if (stock === 0) {
      alert("Este producto no tiene stock disponible.");
      return;
    }
    if (quantity > stock) {
      alert(`Solo hay ${stock} unidades disponibles.`);
      return;
    }

    const productoParaCarrito = {
      ...product,
      variants: variant ? [{ id: variant.id, price: variant.price }] : []
    };

    addItem(productoParaCarrito, quantity);
    alert(`Se añadieron ${quantity} unidades de "${product.title}" al carrito.`);
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    const variant = product?.variants?.[0];
    const stock = variant?.inventory_quantity || 1;

    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(stock, value)));
    }
  };

  const handleIncrease = () => {
    const variant = product?.variants?.[0];
    const stock = variant?.inventory_quantity || 1;
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="blue" height={100} width={100} />
      </div>
    );
  }

  if (error) return <p className="error-message">{error}</p>;

  if (!product) {
    return (
      <div className="no-product-message">
        <p>No se encontró el producto.</p>
      </div>
    );
  }

  const variant = product?.variants?.[0];
  const stock = variant?.inventory_quantity || 0;
  const price = variant?.price || 0;
  const compareAtPrice = variant?.compare_at_price;

  return (
    <div className="detalle-producto-container">
      <h2 className="detalle-producto-title">{product.title || 'Producto sin título'}</h2>

      <div className="detalle-producto-content">
        <div className="detalle-producto-image">
          <img
            src={product.images?.length > 0 ? product.images[0].src : ''}
            alt={product.title || 'Imagen del producto'}
            className="detalle-producto-img"
          />
        </div>

        <div className="detalle-producto-info">
          <p className="detalle-producto-description">
            {product.body_html ? product.body_html.replace(/<\/?[^>]+(>|$)/g, "") : 'No hay descripción disponible'}
          </p>

          <div className="detalle-producto-price">
            <span className="price">${price}</span>
            {compareAtPrice && (
              <span className="old-price">
                <del>${compareAtPrice}</del>
              </span>
            )}
            <p className="product-stock">
              {stock > 0 ? `Stock disponible: ${stock}` : "Sin stock"}
            </p>
          </div>

          <div className="quantity-selector">
            <label htmlFor="quantity">Cantidad:</label>
            <div className="quantity-controls">
              <button onClick={handleDecrease} aria-label="Disminuir cantidad">−</button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                max={stock}
                onChange={handleQuantityChange}
              />
              <button onClick={handleIncrease} aria-label="Aumentar cantidad">+</button>
            </div>
            {quantity === stock && (
              <p className="stock-warning">Stock máximo alcanzado</p>
            )}
          </div>

          <BotonComponente
            nombre="Añadir al carrito"
            onClick={handleAddToCart}
            disabled={stock === 0}
          />

        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
