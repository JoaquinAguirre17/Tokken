import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
    const productosDestacadosIds = [
        '9926953566497',  // ID del producto 1
        '9926946259233',  // ID del producto 2
        '9926946947361',  // ID del producto 3
    ];
    const [productosDestacados, setProductosDestacados] = useState([]);

    useEffect(() => {
        const fetchProductosDestacados = async () => {
            try {
                const res = await fetch('https://tokkenback2.onrender.com/api/shopify/products');
                const data = await res.json();

                const destacados = data.products.filter(product =>
                    productosDestacadosIds.includes(product.id.toString())
                );

                setProductosDestacados(destacados);
            } catch (err) {
                console.error("Error al obtener destacados:", err);
            }
        };

        fetchProductosDestacados();
    }, []);

    return (
        <div className="home-container">

            {/* HERO */}
            <header className="hero text-white text-center d-flex flex-column justify-content-center align-items-center">
                <h1 className="display-4 animate__animated animate__fadeInDown">¡Bienvenido a Tokken!</h1>
                <p className="lead animate__animated animate__fadeInUp">Tecnología, estilo y calidad a tu alcance.</p>
                <Link to="/productos" className="btn btn-outline-light mt-3 animate__animated animate__fadeInUp">Ver productos</Link>
            </header>

            {/* CATEGORÍAS */}
            <section className="categorias container text-center mt-5">
                <h2 className="mb-4">Explorá por categorías</h2>
                <div className="row justify-content-center">
                    <div className="col-md-3 mb-3">
                        <Link to="/telefonia" className="categoria-card">
                            <i className="fas fa-mobile-alt fa-2x"></i>
                            <p>Telefonía</p>
                        </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                        <Link to="/gamer" className="categoria-card">
                            <i className="fas fa-gamepad fa-2x"></i>
                            <p>Gamer</p>
                        </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                        <Link to="/electronica" className="categoria-card">
                            <i className="fas fa-microchip fa-2x"></i>
                            <p>Electrónica</p>
                        </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                        <Link to="/accesorios" className="categoria-card">
                            <i className="fas fa-toolbox fa-2x"></i>
                            <p>Accesorios</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* BENEFICIOS */}
            <section className="beneficios mt-5 py-4 bg-light text-center">
                <div className="container d-flex justify-content-around flex-wrap gap-4">
                    <div className="beneficio-item">
                        <i className="fas fa-truck-moving fa-2x mb-2 text-primary"></i>
                        <p>Envíos a todo el país</p>
                    </div>
                    <div className="beneficio-item">
                        <i className="fas fa-credit-card fa-2x mb-2 text-primary"></i>
                        <p>Todos los medios de pago</p>
                    </div>
                    <div className="beneficio-item">
                        <i className="fas fa-headset fa-2x mb-2 text-primary"></i>
                        <p>Atención personalizada</p>
                    </div>
                </div>
            </section>

            {/* DESTACADOS MOCK */}
            <section className="destacados container mt-5 text-center">
                <h2 className="mb-4">Tendencias del momento</h2>
                <div className="row">
                    {productosDestacados.map(product => (
                        <div key={product.id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm hover-zoom">
                                <img
                                    src={product.images?.[0]?.src || '/img/producto-placeholder.jpg'}
                                    className="card-img-top"
                                    alt={product.title}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.title}</h5>
                                    <p className="card-text">{product.body_html?.replace(/<[^>]+>/g, '').slice(0, 60)}...</p>
                                    <Link to={`/detalle/${product.id}`} className="btn btn-outline-primary">Ver más</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            <section className="mapa-redes mt-5 py-5  text-black">
                <div className="container">
                    <div className="row align-items-center text-center text-md-start">

                        {/* Redes sociales - centradas siempre */}
                        <div className="col-md-6 order-2 order-md-1 d-flex flex-column align-items-center justify-content-center mb-4 mb-md-0">
                            <h4 className="mb-3 text-center">¡Seguinos en nuestras redes!</h4>
                            <div className="d-flex justify-content-center gap-4">
                                <a
                                    href="https://www.instagram.com/tokkencba/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="icon-social"
                                >
                                    <i className="fab fa-instagram fa-3x"></i>
                                </a>
                                <a
                                    href="https://wa.me/3515181404"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="icon-social"
                                >
                                    <i className="fab fa-whatsapp fa-3x"></i>
                                </a>
                                <a
                                    href="https://www.tiktok.com/@tokkencba?_t=ZM-8vQNHCU6Hv3&_r=1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="icon-social"
                                >
                                    <i className="fab fa-tiktok fa-3x"></i>
                                </a>
                            </div>
                        </div>


                        {/* Mapa - ancho completo de su contenedor */}
                        <div className="col-md-6 order-1 order-md-2">
                            <iframe
                                className='mapa-iframe'
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.633526372419!2d-64.16961142468325!3d-31.424221596629597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a38767974ff3%3A0x5a306effac1451c6!2sTOKKEN%20CBA!5e0!3m2!1ses-419!2sar!4v1744311385873!5m2!1ses-419!2sar"
                                width="100%"
                                height="450"
                                allowfullscreen=""
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade">

                            </iframe>
                        </div>

                    </div>
                </div>
            </section>



        </div>
    );
};

export default Home;
