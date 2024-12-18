import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoriesContext = React.createContext();

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar categorías');
      setLoading(false);
    }
  };

  const createCategory = async (categoryName) => {
    try {
      const response = await axios.post(
        'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories',
        { name: categoryName },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCategories((prevCategories) => [...prevCategories, response.data]);
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const createSubcategory = async (subcategoryName, parentId) => {
    try {
      const response = await axios.post(
        'https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories',
        { name: subcategoryName, parent: parentId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCategories((prevCategories) => [...prevCategories, response.data]);
    } catch (error) {
      console.error('Error creando subcategoría:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`https://appencuentro.pagliardini.com/wp-json/wc/v3/products/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      console.error('Error eliminando categoría:', error);
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
        createCategory,
        createSubcategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => React.useContext(CategoriesContext);
