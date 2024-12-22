import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Mostrar notificaciones
  const showNotification = (message, type) => {
    setNotification({ message, type }); // type: 'success' o 'error'
    setTimeout(() => setNotification(null), 3000);
  };

  // Manejo de errores detallado
  const handleApiError = (error) => {
    if (error.response) {
      console.error('Error del servidor:', error.response.data);
      showNotification(`Error: ${error.response.data.message}`, 'error');
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
      showNotification('No se recibió respuesta del servidor.', 'error');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
      showNotification('Error en la solicitud.', 'error');
    }
  };

  // Obtener todas las categorías con paginación
  const fetchCategories = async () => {
    try {
      setLoading(true);
      let page = 1;
      const perPage = 50; // Máximo permitido por la API
      let allCategories = [];
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await axios.get(
          'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories',
          {
            params: { page, per_page: perPage },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            },
          }
        );

        allCategories = [...allCategories, ...response.data];

        if (response.data.length < perPage) {
          hasMoreData = false;
        } else {
          page++;
        }
      }

      setCategories(allCategories);
      setError(null);
    } catch (error) {
      setError('Error al cargar categorías.');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Crear una nueva categoría
  const createCategory = async (categoryName) => {
    try {
      const response = await axios.post(
        'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories',
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCategories((prevCategories) => [...prevCategories, response.data]);
      showNotification('Categoría creada con éxito.', 'success');
    } catch (error) {
      handleApiError(error);
    }
  };

  // Crear una nueva subcategoría
  const createSubcategory = async (subcategoryName, parentId) => {
    try {
      if (!categories.some((cat) => cat.id === parentId)) {
        console.error('El ID de la categoría padre no es válido.');
        showNotification('El ID de la categoría padre no es válido.', 'error');
        return;
      }

      const response = await axios.post(
        'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories',
        { name: subcategoryName, parent: parentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCategories((prevCategories) => [...prevCategories, response.data]);
      showNotification('Subcategoría creada con éxito.', 'success');
    } catch (error) {
      handleApiError(error);
    }
  };

  // Eliminar una categoría
  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(
        `https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories/${categoryId}?force=true`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          },
        }
      );

      setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
      showNotification('Categoría eliminada con éxito.', 'success');
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        notification,
        createCategory,
        createSubcategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => useContext(CategoriesContext);
