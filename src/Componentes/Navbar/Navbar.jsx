import { useState } from 'react'; // Importa useState para controlar el estado del Offcanvas
import { Link } from 'react-router-dom'; 
import { Navbar, Container, Nav, NavDropdown, Offcanvas, Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHome } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap'; 
import './Navbar.css'; 
import CardWidgetComponente from '../CardWidget/CardWidgetComponente';


function NavbarOffcanvas() {
  // Estado para controlar si el Offcanvas está abierto o cerrado
  const [show, setShow] = useState(false);

  // Handler para cuando se hace clic en el enlace, y cerrar el Offcanvas
  const handleLinkClick = () => {
    setShow(false); // Cierra el Offcanvas
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid>
        {/* Marca del Navbar */}
        <Navbar.Brand href="/" className="custom-brand">
          <img className="logo" src="/img/logo3.png" alt="Logo" />
        </Navbar.Brand>

        {/* Botón para togglear Offcanvas */}
        <Navbar.Toggle 
          aria-controls="offcanvasNavbar" 
          className="custom-toggle" 
          onClick={() => setShow(!show)} // Cambia el estado al hacer clic
        />

        {/* Offcanvas para menús móviles */}
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          className="custom-offcanvas"
          show={show} // Vincula el estado show con la visibilidad del Offcanvas
          onHide={() => setShow(false)} // Cierra el Offcanvas cuando se hace clic fuera de él
        >
          <Offcanvas.Header closeButton className="custom-offcanvas-header">
            <Offcanvas.Title id="offcanvasNavbarLabel" className="custom-title">
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="bodycanvas">
            {/* Ícono para ir al Home */}
            <Nav className="ms-auto custom-nav">
              <Nav.Link as={Link} to="/" className="custom-icon" onClick={handleLinkClick}>
                <FaHome size={24} />
              </Nav.Link>
            </Nav>

            {/* Navegación personalizada con categorías y subcategorías */}
            <Nav className="ms-auto custom-nav">
              {/* Botón de la categoría "Telefonía" con Dropdown */}
              <ButtonGroup className="split-btn-group">
                <LinkContainer to="/telefonia" onClick={handleLinkClick}>
                  <Button className="split-dropdown-btn">TELEFONÍA</Button>
                </LinkContainer>
                <Dropdown>
                  <Dropdown.Toggle className="split-dropdown-toggle" id="dropdown-telefonia" />
                  <Dropdown.Menu>
                    <LinkContainer to="/telefonia/accesorios" onClick={handleLinkClick}>
                      <Dropdown.Item>Accesorios</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/telefonia/cargadores" onClick={handleLinkClick}>
                      <Dropdown.Item>Cargadores</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/telefonia/vidrios hidrogel" onClick={handleLinkClick}>
                      <Dropdown.Item>Vidrios Hidrogen</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/telefonia/soportes-auto" onClick={handleLinkClick}>
                      <Dropdown.Item>Soportes Auto</Dropdown.Item>
                    </LinkContainer>
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>

              {/* Botón de la categoría "Gamer" con Dropdown */}
              <ButtonGroup className="split-btn-group">
                <LinkContainer to="/gamer" onClick={handleLinkClick}>
                  <Button className="split-dropdown-btn">GAMER</Button>
                </LinkContainer>
                <Dropdown>
                  <Dropdown.Toggle className="split-dropdown-toggle" id="dropdown-gamer" />
                  <Dropdown.Menu>
                    <LinkContainer to="/gamer/auricularesGamer" onClick={handleLinkClick}>
                      <Dropdown.Item>Auriculares Gamer</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/gamer/consolas" onClick={handleLinkClick}>
                      <Dropdown.Item>Consolas Retro</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/gamer/mouse" onClick={handleLinkClick}>
                      <Dropdown.Item>Mouse</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/gamer/teclados" onClick={handleLinkClick}>
                      <Dropdown.Item>Teclados</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/gamer/kit gamer" onClick={handleLinkClick}>
                      <Dropdown.Item>Kit Gamer</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/gamer/cables de consolas" onClick={handleLinkClick}>
                      <Dropdown.Item>Cables de Consolas</Dropdown.Item>
                    </LinkContainer>
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>

              {/* Botón de la categoría "Electrónica" con Dropdown */}
              <ButtonGroup className="split-btn-group">
                <LinkContainer to="/electronica" onClick={handleLinkClick}>
                  <Button className="split-dropdown-btn">ELECTRÓNICA</Button>
                </LinkContainer>
                <Dropdown>
                  <Dropdown.Toggle className="split-dropdown-toggle" id="dropdown-electronica" />
                  <Dropdown.Menu>
                    <LinkContainer to="/electronica/parlantes" onClick={handleLinkClick}>
                      <Dropdown.Item>Parlantes</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/electronica/auriculares-bluetooth" onClick={handleLinkClick}>
                      <Dropdown.Item>Auriculares Bluetooth</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/electronica/auriculares-cables" onClick={handleLinkClick}>
                      <Dropdown.Item>Auriculares con Cables</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/electronica/pendrivee" onClick={handleLinkClick}>
                      <Dropdown.Item>Pendrive</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/electronica/memoria-ssd" onClick={handleLinkClick}>
                      <Dropdown.Item>Memoria SSD</Dropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/electronica/iluminacion" onClick={handleLinkClick}>
                      <Dropdown.Item>Iluminación</Dropdown.Item>
                    </LinkContainer>
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>
            </Nav>

            {/* Carrito y Login al final de la barra de navegación */}
            <Nav className="ms-auto custom-end-nav">
              <CardWidgetComponente/>
              <Nav.Link as={Link} to="/login" className="custom-icon" onClick={handleLinkClick}>
                <FaUser size={24} />
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default NavbarOffcanvas;
