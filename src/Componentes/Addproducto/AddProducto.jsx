import React, { useState, useEffect } from 'react';
import { useCategories } from '../Contex/CategoriesContext';  // Importar el contexto
import axios from 'axios';
import './AddProducto.css';

const AddProduct = () => {
  const { categories, loading, error } = useCategories();  // Desestructuramos el contexto
  const [subcategories, setSubcategories] = useState([]);  // Estado local para las subcategorías
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(''); // ID de la categoría seleccionada
  const [subcategory, setSubcategory] = useState(''); // ID de la subcategoría seleccionada
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (category) {
      // Filtrar subcategorías asociadas a la categoría seleccionada
      const filteredSubcategories = categories.filter(cat => cat.parent === parseInt(category));
      setSubcategories(filteredSubcategories);  // Actualizar las subcategorías disponibles
    }
  }, [category, categories]);  // Ejecutar cuando cambie la categoría

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);  // Establecer la categoría seleccionada
  };

  const handleSubcategoryChange = (e) => {
    const selectedSubcategory = e.target.value;
    setSubcategory(selectedSubcategory);  // Establecer la subcategoría seleccionada
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);  // Establecer la imagen seleccionada
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Subir la imagen y crear el producto
    const formData = new FormData();
    formData.append('file', image);

    try {
      // Subir la imagen
      const imageResponse = await axios.post('https://papayawhip-koala-105915.hostingersite.com/wp-json/wp/v2/media', formData, {
        headers: {
          'Authorization': 'Basic ' + btoa('ck_680755a33acecf9d418d84a5c19ed42dcff24a19:cs_f2a41a6ee18a5e004f0f96990c89042758c671f8'),
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageId = imageResponse.data.id;

      // Crear producto
      const productData = {
        name,
        description,
        regular_price: price,
        stock_quantity: stock,
        categories: [
          { id: category },  // Enviar la categoría seleccionada
          { id: subcategory },  // Enviar la subcategoría seleccionada
        ],
        images: [
          { id: imageId },  // ID de la imagen subida
        ],
      };

      const response = await axios.post('https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products', productData, {
        headers: {
          'Authorization': 'Basic ' + btoa('ck_680755a33acecf9d418d84a5c19ed42dcff24a19:cs_f2a41a6ee18a5e004f0f96990c89042758c671f8'),  // Usar autenticación básica para WooCommerce
          'Content-Type': 'application/json',
        },
      });

      console.log('Producto creado:', response.data);
    } catch (error) {
      if (error.response) {
        // Mostrar detalles del error si existe una respuesta
        console.error('Error creando el producto:', error.response.data);
      } else {
        // Mostrar mensaje de error si no hay respuesta del servidor
        console.error('Error creando el producto:', error.message);
      }
    }
  };

  // Mostrar carga o errores si es necesario
  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p>Error al cargar categorías: {error}</p>;

  return (
    <div>
      <h2>Añadir Producto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Producto</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Precio</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
        <div>
          <label>Categoría</label>
          <select value={category} onChange={handleCategoryChange} required>
            <option value="">Seleccionar categoría</option>
            {categories.filter(cat => cat.parent === 0).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Subcategoría</label>
          <select value={subcategory} onChange={handleSubcategoryChange} required>
            <option value="">Seleccionar subcategoría</option>
            {subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Imagen</label>
          <input type="file" onChange={handleImageChange} required />
        </div>
        <button type="submit">Añadir Producto</button>
      </form>
    </div>
  );
};

export default AddProduct;
