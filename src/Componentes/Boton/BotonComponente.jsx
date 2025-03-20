import { Link } from 'react-router-dom';
import React from 'react';
import './BotonComponente.css';

function BotonComponente({  nombre, contador, onClick,ruta }) {
    return (
        <Link to={ruta}>
            <button className="btn-carrito" onClick={onClick}>
                {nombre}
                {contador > 0 && <span className="contador">{contador}</span>}
            </button>
        </Link>
    );
}

export default BotonComponente;
