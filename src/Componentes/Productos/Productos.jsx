import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactLoading from 'react-loading';
import './Productos.css';
import BotonComponente from '../Boton/BotonComponente';

const Productos = () => {
  const { category, subcategory } = useParams(); // Obtenemos los parámetros de la URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Imprimir la URL antes de realizar la solicitud para verificar que es correcta
        console.log('Solicitando productos desde:', 'https://tokkenback2.onrender.com/api/shopify/products');
        
        const response = await fetch('https://tokkenback2.onrender.com/api/shopify/products', {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          // Imprimir error si la respuesta no es OK
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Productos obtenidos:", data);

        let filteredProducts = data.products;

        // Filtrar por categoría si existe (ignorando mayúsculas)
        if (category) {
          filteredProducts = filteredProducts.filter(
            p => p.product_type?.toLowerCase() === category.toLowerCase()
          );
        }

        // Filtrar por subcategoría (tag) si existe (ignorando mayúsculas)
        if (subcategory) {
          filteredProducts = filteredProducts.filter(p => {
            let productTags = [];

            if (typeof p.tags === "string") {
              productTags = p.tags.split(",").map(tag => tag.trim().toLowerCase());
            } else if (Array.isArray(p.tags)) {
              productTags = p.tags.map(tag => tag.toLowerCase());
            }

            return productTags.includes(subcategory.toLowerCase());
          });
        }

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        
        // Mostrar el mensaje de error detallado
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
        <ReactLoading type="spin" color="blue" height={100} width={100} />
      </div>
    );
  }

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="products-container">
      <h2 className="products-title">Productos Disponibles</h2>

      {products.length === 0 ? (
        <div className="no-products-message">
          <p>No hay productos disponibles en esta categoría/subcategoría.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                className="product-image"
                src={product.images?.length > 0 ? product.images[0].src : ''}
                alt={product.title}
              />
              <div className="product-details">
                <h5 className="product-name">{product.title}</h5>
                <p className="product-price">Precio: ${product.variants[0]?.price}</p>
                <p className="product-stock">
                  {product.variants[0]?.inventory_quantity !== undefined
                    ? product.variants[0]?.inventory_quantity > 0
                      ? `Stock disponible: ${product.variants[0].inventory_quantity}`
                      : "Sin stock"
                    : "Stock no disponible"}
                </p>
              </div>
              <BotonComponente nombre={'Ver Detalle'} ruta={`/detalle/${product.id}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Productos;
