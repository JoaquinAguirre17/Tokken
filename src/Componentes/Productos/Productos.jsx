import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactLoading from 'react-loading';
import './Productos.css';
import BotonComponente from '../Boton/BotonComponente';

const Productos = () => {
  const [products, setProducts] = useState([]); // Estado para productos
  const [loading, setLoading] = useState(true); // Estado para loading
  const [error, setError] = useState(null); // Estado para errores
  const { category, subcategory } = useParams(); // Obtener parámetros dinámicos

  const apiUrl = 'https://appencuentro.pagliardini.com/wp-json/wc/v3/products';
  const credentials = btoa('ck_6c9332054ef29d8f8700cd91c8a61991a3112dda:cs_efa0c320611d3a7ee041d8fef15bc71b6c068590');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Basic ${credentials}` },
        });

        if (!response.ok) throw new Error('Error al cargar productos');

        const data = await response.json();

        // Filtrar productos por categoría y subcategoría
        const filteredProducts = data.filter((product) => {
          const normalizedCategory = product.categories[0]?.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          const normalizedCategoryFilter = category
            ? category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
            : '';

          return normalizedCategory === normalizedCategoryFilter;
        });

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('Error al cargar productos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  // Loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="orange" height={100} width={100} />
      </div>
    );
  }

  // Mostrar error
  if (error) return <p className="error-message">{error}</p>;

  // No hay productos
  if (products.length === 0) {
    return (
      <div className="no-products-message">
        <p>No hay productos disponibles en la categoría {category} {subcategory && ` - ${subcategory}`}.</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h2 className="products-title">
        Productos de {category} {subcategory && ` - ${subcategory}`}
      </h2>
      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              className="product-image"
              src={product.images && product.images.length > 0 ? product.images[0].src : ''}
              alt={product.name}
            />
            <div className="product-details">
              <h5 className="product-name">{product.name}</h5>
              <p className="product-price">Precio: ${product.price}</p>
            </div>
            <BotonComponente nombre={'Ver Detalle'} ruta={`/detalle/${product.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;
