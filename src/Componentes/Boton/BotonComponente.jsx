import { Link } from 'react-router-dom'
import React from 'react'
import './BotonComponente.css'

function BotonComponente({ ruta, nombre, contador }) {
    return (
        <>

            <Link to={ruta}>
                <button className="btn-carrito">
                    {nombre}
                    {contador}
                </button>
                
               
            </Link>
        </>
    )
}
export default BotonComponente