import CardComponents from "../CardComponent/CardComponents";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Carousel1 from "../CARRUSEL/Carousel";
import { Link } from "react-router-dom";
import './Home.css'
import React, { useState } from 'react';
import Modal from '../Modal/Modal'; // Asegúrate de que la ruta sea correcta
import BlurText from "../BlurText/BlurText";





function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAnimationComplete = () => {
        console.log("¡Animación completada!");
    };

    return (
        <>
            <div className="container">
                <div className="caouselHome">
                    <Carousel1 />
                </div>
                <div className="seccionCategorias">
                    <Link to="/telefonia">
                        <button className="botonTelefonia "></button>
                    </Link>
                    <Link to="/electronica">
                        <button className="botonElectronica"></button>
                    </Link>
                    <Link to="/gamer">
                        <button className="botonGamer"></button>
                    </Link>
                </div>

                <div className="productosDestacados">
                    <div className="tituloDestacados">
                        <h2>TENDENCIAS</h2>
                    </div>
                    <div className="cardsDestacados">
                        <CardComponents imagen='https://www.syncfusion.com/blogs/wp-content/uploads/2022/10/React-Router-vs.-React-Router-DOM.png' titulo='Producto 1' texto='Hola mundo hoy es sabado' />
                        <CardComponents imagen='https://www.syncfusion.com/blogs/wp-content/uploads/2022/10/React-Router-vs.-React-Router-DOM.png' titulo='Producto 2' texto='Hola mundo hoy es sabado' />
                        <CardComponents imagen='https://www.syncfusion.com/blogs/wp-content/uploads/2022/10/React-Router-vs.-React-Router-DOM.png' titulo='Producto 3' texto='Hola mundo hoy es sabado' />
                        <CardComponents imagen='https://www.syncfusion.com/blogs/wp-content/uploads/2022/10/React-Router-vs.-React-Router-DOM.png' titulo='Producto 3' texto='Hola mundo hoy es sabado' />
                        <CardComponents imagen='https://www.syncfusion.com/blogs/wp-content/uploads/2022/10/React-Router-vs.-React-Router-DOM.png' titulo='Producto 3' texto='Hola mundo hoy es sabado' />
                    </div>
                </div>

                <div className="redesyubicacion">
                    <div className="redes">
                        <ul className="socialshome">
                            <li><a href="https://www.instagram.com/technoshop.nc/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
                            <li><a href="https://wa.me/3512318469" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a></li>
                        </ul>
                    </div>
                    <div className="maps">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1702.3013756219777!2d-64.16836334561933!3d-31.425069248920575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x943298fff62e0a9b%3A0xf98eb5932a694f97!2sSuper%20Mami%20San%20Vicente!5e0!3m2!1ses-419!2sar!4v1733781907977!5m2!1ses-419!2sar" loading="lazy" referrerPolicy="no-referrer"></iframe> </div>
                </div>
                <div className="seccionMarcas">

                    <img className='marcaimg' src="/img/Marcas-02.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-03.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-04.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-05.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-06.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-07.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-08.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-09.png" alt="" />
                    <img className='marcaimg' src="/img/Marcas-10.png" alt="" />
                </div>
                <div className="seccionInformes">

                    {/* boton envios */}
                    <button className="shipping-button">
                        <div className="icon">
                            <i className="fas fa-truck-moving"></i>

                        </div>
                        <div className="text">
                            <span>Envíos a todo el país y retiro gratis</span>
                        </div>
                    </button>
                    {/* boton medios de pagos */}
                    <button className="payment-button" onClick={openModal}>
                        <Modal isOpen={isModalOpen} onClose={closeModal} />
                        <div className="icon">
                            <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="text">
                            <span>Medios de pago</span>
                        </div>
                    </button>

                </div>

            </div>
        </>
    )
}
export default Home;
