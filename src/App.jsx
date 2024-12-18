import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import './App.css';

// Componentes existentes
import Home from './Componentes/HOME/Home.jsx';
import NavbarOffcanvas from './Componentes/Navbar/Navbar.jsx';
import { CartProvider } from './Componentes/Contex/CartContex.jsx';
import Productos from './Componentes/Productos/Productos.jsx';
import Login from './Componentes/Login/Login.jsx';
import PrivateRoute from './Componentes/Login/PrivateRoute.jsx';
import ProductosLogin from './Componentes/ProdcutosLogin/ProductosLogin.jsx';
import { CategoriesProvider } from './Componentes/Contex/CategoriesContext.jsx';


function App() {
  return (
    <CartProvider>
      <CategoriesProvider>
        <Router>
          <NavbarOffcanvas />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/admin' element={<PrivateRoute><ProductosLogin /></PrivateRoute>} />

            {/* Ruta dinámica para categorías y subcategorías */}
            <Route path='/:category' element={<Productos />} />
            <Route path='/:category/:subcategory' element={<Productos />} />


            {/* Ruta de fallback */}
            <Route
              path='*'
              element={<h2 style={{ textAlign: 'center', marginTop: '20px' }}>Página no encontrada</h2>}
            />
          </Routes>
        </Router>
      </CategoriesProvider>
    </CartProvider>
  );
}

export default App;
