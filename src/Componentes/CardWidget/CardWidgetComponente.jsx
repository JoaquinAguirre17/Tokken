import React from 'react';
import { useCart } from '../Contex/CartContex';
import BotonComponente from '../Boton/BotonComponente';

function CardWidgetComponente({onClick} ) {
    const { totalCountProducts } = useCart();  // Usar el totalCountProducts desde el contexto

    return (
        <BotonComponente 
        nombre={`🛒`} 
        ruta={'/carrito'} 
        contador={totalCountProducts()} 
        onClick={onClick}  // 👈 ¡Acá se pasa!
    />
    );
}

export default CardWidgetComponente;
