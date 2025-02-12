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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `tokkenbackshopify:5000`,  // Cambia a la URL de tu backend local
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Productos obtenidos:", data);

        // Filtrar productos por categoría y subcategoría
        const filteredProducts = data.filter((product) => { 
          if (!product.categories || product.categories.length === 0) return false;

          const normalizedCategories = product.categories.map((cat) =>
            cat.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          );

          const normalizedCategoryFilter = category
            ? category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
            : '';
          const normalizedSubcategoryFilter = subcategory
            ? subcategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
            : '';

          const categoryMatch = normalizedCategories.includes(normalizedCategoryFilter);
          const subcategoryMatch = normalizedSubcategoryFilter
            ? normalizedCategories.includes(normalizedSubcategoryFilter)
            : true;

          return categoryMatch && subcategoryMatch;
        });

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setError(`Error al cargar productos. Detalles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  if (loading) {
    return (
      <div className="loading-container">
        <ReactLoading type="spin" color="orange" height={100} width={100} />
      </div>
    );
  }

  if (error) return <p className="error-message">{error}</p>;

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
