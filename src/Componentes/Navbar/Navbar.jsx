import { useState, useEffect } from 'react'; 
import {
  Navbar, Container, Nav, Offcanvas, Dropdown,
  InputGroup, Form, Button, Spinner, ButtonGroup
} from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHome } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import CardWidgetComponente from '../CardWidget/CardWidgetComponente';

function NavbarOffcanvas() {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLinkClick = () => {
    setQuery('');
    setResultados([]);
    handleClose();
  };

  const handleResultClick = (id) => {
    handleLinkClick();
    navigate(`/detalle/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (query.length < 2) {
        setResultados([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://tokkenback2.onrender.com/api/shopify/products');
        const data = await res.json();
        const filtrados = data.products.filter(p =>
          p.title.toLowerCase().includes(query.toLowerCase())
        );
        setResultados(filtrados.slice(0, 5));
      } catch (err) {
        setError('Hubo un problema al obtener los productos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Navbar expand="lg" className="custom-navbar shadow-sm py-2">
      <Container fluid className="align-items-center justify-content-between px-3">
        <Navbar.Brand href="/" className="custom-brand d-flex align-items-center">
          <img className="logo me-2" src="/img/logo3.png" alt="Logo" style={{ height: '100px' }} />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          onClick={handleShow}
          className="d-block d-sm-none"
        />

        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          show={show}
          onHide={handleClose}
          className="custom-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="nav-contenido">
              <div className="categoriass">
                <DropdownMenu title="Telefonia" categories={[
                  'Auriculares', 'Cargadores', 'Cables', 'Auriculares Inalambricos',
                  'Accesorios para dispositivos', 'Adaptadores', 'Receptores Bluetooth'
                ]} onClick={handleLinkClick} />
                <DropdownMenu title="Gamer" categories={[
                  'Cables', 'Auriculares', 'Accesorios para juegos',
                  'Joysticks para celular', 'Perifericos'
                ]} onClick={handleLinkClick} />
                <DropdownMenu  title="Electronica" categories={[
                  'Cables', 'Relojes', 'Computacion', 'Oficina',
                  'Iluminacion y accesorios', 'Parlantes',
                  'Microfonos', 'Decoracion', 'Figuras coleccionables',
                  'Almacenamiento', 'Camaras de seguridad'
                ]} onClick={handleLinkClick} />
                <DropdownMenu title="Accesorios" categories={[
                  'Llavero', 'Juguetes Popit', 'Soportes', 'Selfie sticks',
                  'Pilas', 'Repuestos para wearables', 'Organizadores',
                  'Mates y botellas'
                ]} onClick={handleLinkClick} />
              </div>

              <div className="buscadorycarrito">
                <div className='buscador'>
                  <Form className="d-flex position-relative" role="search" onSubmit={(e) => e.preventDefault()}>
                    <InputGroup>
                      <Form.Control
                        type="search"
                        placeholder="🔍Buscar productos..."
                        aria-label="Buscar"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                      />
                    </InputGroup>

                    {open && query.length >= 2 && resultados.length > 0 && (
                      <div className="resultados-lista-navbar">
                        {resultados.map((p) => (
                          <div key={p.id} className="resultado-item-navbar" onClick={() => handleResultClick(p.id)}>
                            <img src={p.images[0]?.src} alt={p.title} className="resultado-img-navbar" />
                            <div className="resultado-info-navbar">
                              <span>{p.title}</span>
                              <span className="resultado-precio-navbar">${p.variants[0]?.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form>
                  {loading && (
                    <Spinner animation="border" role="status" size="sm" className="mt-2">
                      <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                  )}
                </div>

                <div className="carrito">
                  <CardWidgetComponente onClick={handleLinkClick} />
                </div>
              </div>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

// 🔧 Esta parte es la única que cambiamos:
function DropdownMenu({ title, categories, onClick }) {
  return (
    <div className="boton-categorias">
      <ButtonGroup className="split-btn-group">
        <LinkContainer to={`/${title.toLowerCase()}`} onClick={onClick}>
          <Button className="split-dropdown-btn">{title}</Button>
        </LinkContainer>
        <Dropdown>
          <Dropdown.Toggle className="split-dropdown-toggle" id={`dropdown-${title}`} />
          <Dropdown.Menu>
            {categories.map((category, index) => (
              <LinkContainer
                key={index}
                to={`/${title.toLowerCase()}/${category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                onClick={onClick}
              >
                <Dropdown.Item>{category}</Dropdown.Item>
              </LinkContainer>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </div>
  );
}

export default NavbarOffcanvas;
