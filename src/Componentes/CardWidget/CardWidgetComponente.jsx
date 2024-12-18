import React from 'react';
import { useCart } from '../Contex/CartContex';

import BotonComponente from '../Boton/BotonComponente';

function CardWidgetComponente() {
   const {totalCountProducts}=useCart();

    return (
        <div>
         <BotonComponente nombre={`🛒`} ruta={'/carrito'} contador={totalCountProducts()} />
        
        </div>
    );
}

export default CardWidgetComponente;



