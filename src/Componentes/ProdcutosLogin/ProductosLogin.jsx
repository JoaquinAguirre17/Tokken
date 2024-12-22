import { useState } from "react";
import AddProduct from "../Addproducto/AddProducto";

import './ProductosLogin.css'
const ProductosLogin = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>

            <div className="container">

                <button onClick={openModal}>Añadir Producto</button>

                <AddProduct isOpen={isModalOpen} closeModal={closeModal} />

            </div>

        </>
    )
}
export default ProductosLogin;