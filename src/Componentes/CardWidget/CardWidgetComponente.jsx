import React from 'react';
import { useCart } from '../Contex/CartContex';
import BotonComponente from '../Boton/BotonComponente';

function CardWidgetComponente() {
    const { totalCountProducts } = useCart();  // Usar el totalCountProducts desde el contexto

    return (
        <div>
            {/* Asegurarse de pasar el número de productos directamente */}
            <BotonComponente nombre={`🛒`} ruta={'/carrito'} contador={totalCountProducts()} />
        </div>
    );
}

export default CardWidgetComponente;
