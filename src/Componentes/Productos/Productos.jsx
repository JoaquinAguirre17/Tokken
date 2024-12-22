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
    // Función asíncrona para obtener los productos
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products', {
          headers: {
            'Authorization': 'Basic ' + btoa('ck_680755a33acecf9d418d84a5c19ed42dcff24a19:cs_f2a41a6ee18a5e004f0f96990c89042758c671f8')  // Sustituir con las claves correctas
          }
        });

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Productos obtenidos:', data); // Verifica los productos obtenidos

        // Filtrar productos por categoría y subcategoría
        const filteredProducts = data.filter((product) => {
          // Verificar si el producto tiene categorías
          if (!product.categories || product.categories.length === 0) return false;

          // Normalizar las categorías del producto
          const normalizedCategories = product.categories.map((cat) =>
            cat.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          );

          console.log('Categorias del producto:', normalizedCategories); // Verifica las categorías de cada producto
          console.log('Categoría de filtro:', category, 'Subcategoría de filtro:', subcategory); // Muestra los filtros actuales

          // Normalizar las categorías de los parámetros de URL
          const normalizedCategoryFilter = category
            ? category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            : '';
          const normalizedSubcategoryFilter = subcategory
            ? subcategory.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            : '';

          console.log('Categoría filtrada:', normalizedCategoryFilter);
          console.log('Subcategoría filtrada:', normalizedSubcategoryFilter);

          // Filtrar los productos que coincidan con la categoría o subcategoría
          const categoryMatch = normalizedCategories.includes(normalizedCategoryFilter);
          const subcategoryMatch = normalizedSubcategoryFilter
            ? normalizedCategories.includes(normalizedSubcategoryFilter)
            : true; // Si no hay subcategoría, no filtrar por subcategoría

          console.log('Coincide con categoría:', categoryMatch, 'Coincide con subcategoría:', subcategoryMatch);

          return categoryMatch && subcategoryMatch;
        });

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError(`Error al cargar productos. Detalles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]); // Dependencias para recargar la función cuando cambian las categorías

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
