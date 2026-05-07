import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactLoading from 'react-loading';
import './Productos.css';
import BotonComponente from '../Boton/BotonComponente';

const API_URL = 'https://tokkenback2.onrender.com/api/products';

// 👉 Normaliza un producto (Shopify o Mongo) a un formato común para pintar la UI
function normalizeProduct(p) {
  const id = p._id ?? p.id ?? p.handle ?? '';
  const title = p.title ?? '';

  // Imagen (Shopify: images[].src o image.src) (Mongo: images[].url o string)
  let image = '';
  if (Array.isArray(p.images) && p.images.length) {
    const first = p.images[0];
    image = typeof first === 'string' ? first : (first.src ?? first.url ?? '');
  } else if (p.image?.src) {
    image = p.image.src;
  }

  // Precio (Mongo: pricing.sale || pricing.list; Shopify: variants[0].price)
  const price =
    p.pricing?.sale ??
    p.pricing?.list ??
    (p.variants?.[0]?.price ? Number(p.variants[0].price) : undefined);

  // Stock (Mongo: variants[0].stock || inventory[0].qty; Shopify: variants[0].inventory_quantity)
  const stock =
    p.variants?.[0]?.stock ??
    p.inventory?.[0]?.qty ??
    p.variants?.[0]?.inventory_quantity;

  // Categoría / tags (para filtros)
  const category = (p.category ?? p.product_type ?? '').toString();
  const tags = Array.isArray(p.tags)
    ? p.tags.map(t => String(t))
    : typeof p.tags === 'string'
      ? p.tags.split(',').map(t => t.trim())
      : [];

  return { id, title, image, price, stock, category, tags };
}

const Productos = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let abort = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL); // GET sin headers para evitar preflight
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} – ${text.slice(0,120)}`);
        }

        const data = await res.json();
        console.log('Productos obtenidos:', data);

        // Aceptar array directo o { products: [...] }
        const raw = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
        let normalized = raw.map(normalizeProduct);

        // Filtro por categoría (case-insensitive)
        if (category) {
          normalized = normalized.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        // Filtro por subcategoría como tag (case-insensitive)
        if (subcategory) {
          normalized = normalized.filter(p =>
            p.tags.map(t => t.toLowerCase()).includes(subcategory.toLowerCase())
          );
        }

        if (!abort) setProducts(normalized);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        if (!abort) setError(`Error al cargar productos. Detalles: ${err.message}`);
      } finally {
        if (!abort) setLoading(false);
      }
    };

    fetchProducts();
    return () => { abort = true; };
  }, [category, subcategory]);

  if (loading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" />
      </div>
    );
  }

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="products-container">
      <h2 className="products-title">Productos Disponibles</h2>

      {products.length === 0 ? (
        <div className="no-products-message">
          <p>No hay productos disponibles en esta categoría/subcategoría.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <img
                className="product-image"
                src={p.image || ''}
                alt={p.title}
                loading="lazy"
              />
              <div className="product-details">
                <h5 className="product-name">{p.title}</h5>
                <p className="product-price">
                  Precio: {p.price !== undefined ? `$${p.price}` : '—'}
                </p>
                <p className="product-stock">
                  {typeof p.stock === 'number'
                    ? p.stock > 0
                      ? `Stock disponible: ${p.stock}`
                      : 'Sin stock'
                    : 'Stock no disponible'}
                </p>
              </div>
              <BotonComponente nombre="Ver Detalle" ruta={`/detalle/${p.id}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Productos;
