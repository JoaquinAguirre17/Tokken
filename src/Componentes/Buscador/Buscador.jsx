import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './Buscador.css';

const API_SEARCH = 'https://tokkenback2.onrender.com/api/products/search';

function normalizeProduct(p) {
  // ID
  const id = p._id ?? p.id ?? p.handle ?? '';

  // Título
  const title = p.title ?? '';

  // Imagen (Mongo vs Shopify)
  let image = '';
  if (Array.isArray(p.images) && p.images.length) {
    const first = p.images[0];
    image = typeof first === 'string'
      ? first
      : (first.url ?? first.src ?? '');
  } else if (p.image?.src) {
    image = p.image.src;
  }

  // Precio (Mongo vs Shopify)
  const price =
    p?.pricing?.sale ??
    p?.pricing?.list ??
    (p?.variants?.[0]?.price ? Number(p.variants[0].price) : undefined);

  return { id, title, image, price };
}

const Buscador = ({ handleLinkClick }) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const blurTimeout = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }

    setLoading(true);

    // Cancelar petición anterior si existe
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const url = `${API_SEARCH}?query=${encodeURIComponent(query.trim())}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

        const data = await res.json();
        // Aceptar array directo o { products: [...] } / { items: [...] }
        const raw = Array.isArray(data)
          ? data
          : (Array.isArray(data.products) ? data.products : (Array.isArray(data.items) ? data.items : []));

        const normalized = raw.map(normalizeProduct).slice(0, 5);
        setResultados(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al buscar:', err);
          setResultados([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  const goToDetail = (id) => {
    setQuery('');
    setResultados([]);
    if (typeof handleLinkClick === 'function') handleLinkClick();
    navigate(`/detalle/${id}`);
  };

  const handleInputFocus = () => setOpen(true);

  // Evitar que el blur cierre la lista antes del click
  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 120);
  };
  const cancelBlur = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
  };

  return (
    <div className="buscador-wrapper">
      <FaSearch className="search-icon" onClick={handleInputFocus} />
      <input
        type="text"
        className={`form-control ${open ? 'open' : ''}`}
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
      />

      {loading && (
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
        </div>
      )}

      {open && query.length >= 2 && resultados.length > 0 && (
        <ul className="resultados-lista" onMouseDown={cancelBlur}>
          {resultados.map(p => (
            <li
              key={p.id}
              className="resultado-item"
              onMouseDown={(e) => { e.preventDefault(); goToDetail(p.id); }} // evita perder foco antes de navegar
            >
              <img
                src={p.image || ''}
                alt={p.title}
                className="resultado-img"
                loading="lazy"
              />
              <div className="resultado-info">
                <span className="resultado-titulo">{p.title}</span>
                <span className="resultado-precio">{p.price != null ? `$${p.price}` : '—'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Buscador;
