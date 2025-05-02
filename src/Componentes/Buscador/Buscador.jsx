import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // Importando el ícono de búsqueda
import './Buscador.css';

const Buscador = ({ handleLinkClick }) => {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false); // Para abrir/cerrar el input
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (query.length < 2) {
                setResultados([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch('https://tokkenback2.onrender.com/api/shopify/products');
                const data = await res.json();

                const filtrados = data.products.filter(p =>
                    p.title.toLowerCase().includes(query.toLowerCase())
                );
                setResultados(filtrados.slice(0, 5)); // max 5 sugerencias
            } catch (err) {
                console.error('Error al buscar:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchData, 300); // Espera para evitar peticiones cada tecla

        return () => clearTimeout(timeout);
    }, [query]);

    const handleResultClick = (id) => {
        setQuery('');
        setResultados([]);
        handleLinkClick();
        navigate(`/detalle/${id}`);
    };

    const handleInputFocus = () => setOpen(true);

    return (
        <div className="buscador-wrapper">
            <FaSearch className="search-icon" onClick={handleInputFocus} />
            <input
                type="text"
                className={`form-control ${open ? 'open' : ''}`}
                placeholder="Buscar productos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => setOpen(false)} // Cierra al perder el foco
            />
            {loading && <div className="loader"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>}

            {query.length >= 2 && resultados.length > 0 && (
                <ul className="resultados-lista">
                    {resultados.map(p => (
                        <li key={p.id} onClick={() => handleResultClick(p.id)} className="resultado-item">
                            <img src={p.images[0]?.src} alt={p.title} className="resultado-img" />
                            <div className="resultado-info">
                                <span>{p.title}</span>
                                <span className="resultado-precio">${p.variants[0]?.price}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Buscador;
