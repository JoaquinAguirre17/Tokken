// src/DetalleProducto/DetalleProducto.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../Contex/CartContex';
import ReactLoading from 'react-loading';
import './DetalleProducto.css';
import BotonComponente from '../Boton/BotonComponente';

const API_BASE = 'https://tokkenback2.onrender.com/api/products';

const DetalleProducto = () => {
  const { id } = useParams(); // puede ser _id de Mongo o slug
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Normalizador: acepta Mongo o Shopify y devuelve un shape común
  const normalize = (p) => {
    if (!p) return null;

    // ID: Mongo usa _id, Shopify usa id
    const pid = p._id || p.id || p.handle || '';

    // Título/Descripción
    const title = p.title || '';
    const description =
      p.description || (p.body_html ? p.body_html.replace(/<\/?[^>]+(>|$)/g, '') : '');

    // Imagen principal
    let image = '';
    if (Array.isArray(p.images) && p.images.length) {
      const first = p.images[0];
      image = typeof first === 'string' ? first : (first.url || first.src || '');
    } else if (p.image?.src) {
      image = p.image.src;
    }

    // Precio: Mongo -> pricing.sale || pricing.list; Shopify -> variants[0].price
    const price =
      (p.pricing?.sale ?? p.pricing?.list) ??
      (p.variants?.[0]?.price ? Number(p.variants[0].price) : undefined) ??
      0;

    // Stock: Mongo -> variants[0].stock || inventory[0].qty; Shopify -> variants[0].inventory_quantity
    const stock =
      (typeof p.variants?.[0]?.stock === 'number' ? p.variants[0].stock : undefined) ??
      (typeof p.inventory?.[0]?.qty === 'number' ? p.inventory[0].qty : undefined) ??
      (typeof p.variants?.[0]?.inventory_quantity === 'number'
        ? p.variants[0].inventory_quantity
        : undefined) ??
      0;

    // Variantes minimal
    const firstVariant = p.variants?.[0] || null;

    return {
      _raw: p,
      id: pid,
      title,
      description,
      image,
      price,
      stock, // 👈 muy importante
      variantPrice: firstVariant?.price,
      variantId: firstVariant?.id || firstVariant?._id || firstVariant?.sku,
      variantObj: firstVariant,
    };
  };

  useEffect(() => {
    let abort = false;

    const safeJson = async (res) => {
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return null;
      try { return await res.json(); } catch { return null; }
    };

    const fetchDetail = async () => {
      setLoading(true); setError(null); setProduct(null);

      try {
        // 1) intento por /:id
        let res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await safeJson(res);
          const p = data?.product || data;
          const norm = normalize(p);
          if (!abort) { setProduct(norm); setLoading(false); }
          return;
        }

        // 2) intento por slug
        res = await fetch(`${API_BASE}/slug/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await safeJson(res);
          const p = data?.product || data;
          const norm = normalize(p);
          if (!abort) { setProduct(norm); setLoading(false); }
          return;
        }

        // 3) fallback: traer lista y buscar por _id/slug
        res = await fetch(API_BASE);
        if (res.ok) {
          const list = await safeJson(res);
          const arr = Array.isArray(list) ? list : (Array.isArray(list?.products) ? list.products : []);
          const found = arr.find(p => p._id === id || p.slug === id || String(p.id) === id);
          if (found) {
            const norm = normalize(found);
            if (!abort) { setProduct(norm); setLoading(false); }
            return;
          }
        }

        throw new Error('No se encontró el producto.');
      } catch (e) {
        if (!abort) { setError(e.message || 'Error cargando detalle'); setLoading(false); }
      }
    };

    fetchDetail();
    return () => { abort = true; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.id) {
      console.error('Error: El producto no tiene un ID válido.');
      return;
    }

    const stock = product.stock || 0;
    if (stock === 0) return alert('Este producto no tiene stock disponible.');
    if (quantity > stock) return alert(`Solo hay ${stock} unidades disponibles.`);

    // 🎯 Estructura que consume tu CartContext, con stock explícito
    const productoParaCarrito = {
      id: product.id,
      title: product.title,
      price: product.price || product.variantPrice || 0,
      image: product.image || '',
      stock: product.stock || 0,         // 👈 envia stock
      _maxStock: product.stock || 0,     // 👈 tope explícito (si tu CartContext lo usa)
      variants: product.variantObj
        ? [{
            id: product.variantId,
            price: product.variantPrice || product.price || 0,
            stock: product.stock || 0,   // 👈 por si tu CartContext mira acá
          }]
        : [],
      _raw: product._raw,
    };

    addItem(productoParaCarrito, quantity);
    alert(`Se añadieron ${quantity} unidades de "${product.title}" al carrito.`);
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    const stock = product?.stock || 1;
    if (!isNaN(value)) setQuantity(Math.max(1, Math.min(stock, value)));
  };

  const handleIncrease = () => {
    const stock = product?.stock || 1;
    if (quantity < stock) setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
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

  const stock = product.stock || 0;
  const price = product.price || 0;

  return (
    <div className="detalle-producto-container">
      <h2 className="detalle-producto-title">{product.title || 'Producto sin título'}</h2>

      <div className="detalle-producto-content">
        <div className="detalle-producto-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title || 'Imagen del producto'}
              className="detalle-producto-img"
            />
          ) : (
            <div className="detalle-producto-img detalle-producto-img--placeholder">
              Sin imagen
            </div>
          )}
        </div>

        <div className="detalle-producto-info">
          <p className="detalle-producto-description">
            {product.description || 'No hay descripción disponible'}
          </p>

          <div className="detalle-producto-price">
            <span className="price">${price}</span>
            <p className="product-stock">
              {stock > 0 ? `Stock disponible: ${stock}` : 'Sin stock'}
            </p>
          </div>

          <div className="quantity-selector">
            <label htmlFor="quantity">Cantidad:</label>
            <div className="quantity-controls">
              <button type="button" onClick={handleDecrease} aria-label="Disminuir cantidad">−</button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                max={stock || 1}
                onChange={handleQuantityChange}
              />
              <button type="button" onClick={handleIncrease} aria-label="Aumentar cantidad">+</button>
            </div>
            {stock > 0 && quantity === stock && (
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
