import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crear el contexto
const CategoriesContext = createContext();

// Proveedor de Contexto
export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener las categorías y subcategorías desde la API
  const fetchCategories = async () => {
    const API_URL = 'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories';
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCategories(response.data);  // Guardamos las categorías en el estado
    } catch (error) {
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();  // Obtener las categorías al montar el componente
  }, []);

  // Función para obtener las subcategorías de una categoría
  const getSubcategories = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.subcategories : [];
  };

  return (
    <CategoriesContext.Provider value={{ categories, loading, error, getSubcategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

// Hook para usar el contexto en otros componentes
export const useCategories = () => {
  return useContext(CategoriesContext);
};
