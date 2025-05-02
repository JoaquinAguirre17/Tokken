import { Link } from "react-router-dom";
import './Footer.css';

function Footer() {
    return (
        <footer className="footer bg-dark text-white pt-5 pb-3 mt-5">
            <div className="container">
                <div className="row text-center text-md-start">
                    {/* LOGO y nombre */}
                    <div className="col-md-3 mb-4">
                        <img src="/img/logo3.png" alt="Logo" className="footer-logo mb-2" />
                        <p className="small">Calidad, tecnología y atención personalizada.</p>
                    </div>

                    {/* Navegación */}
                    <div className="col-md-3 mb-4">
                        <h5>Enlaces útiles</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="footer-link">Inicio</Link></li>
                            <li><Link to="/telefonia" className="footer-link">Telefonía</Link></li>
                            <li><Link to="/gamer" className="footer-link">Gamer</Link></li>
                            <li><Link to="/electronica" className="footer-link">Electrónica</Link></li>
                            <li><Link to="/accesorios" className="footer-link">Accesorios</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-md-3 mb-4">
                        <h5>Contacto</h5>
                        <p className="small mb-1"><i className="fas fa-phone me-2"></i>+54 351 518-1404</p>
                        <p className="small mb-1"><i className="fas fa-envelope me-2"></i>tokkencba@gmail.com</p>
                        <p className="small"><i className="fas fa-map-marker-alt me-2"></i>San Vicente, Córdoba</p>
                    </div>

                    {/* Redes Sociales */}
                    <div className="col-md-3 mb-4">
                        <h5>Seguinos</h5>
                        <div className="d-flex justify-content-center justify-content-md-start gap-3">
                            <a href="https://www.instagram.com/tokkencba" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-instagram fa-lg"></i></a>
                            <a href="https://wa.me/3515181404" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-whatsapp fa-lg"></i></a>
                            <a href="https://www.tiktok.com/@tokkencba?_t=ZM-8vQNHCU6Hv3&_r=1" target="_blank" rel="noopener noreferrer" className="footer-social"> <i className="fab fa-tiktok fa-lg"></i> </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <hr className="border-gray my-3" />
                <div className="text-center small">
                    © {new Date().getFullYear()} Tokken CBA - Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
