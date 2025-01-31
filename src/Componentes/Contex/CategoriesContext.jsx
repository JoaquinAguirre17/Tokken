import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // 🔔 Mostrar notificaciones
  const showNotification = (message, type) => {
    setNotification({ message, type }); // type: 'success' o 'error'
    setTimeout(() => setNotification(null), 3000);
  };

  // ⚠️ Manejo de errores detallado
  const handleApiError = (error) => {
    if (error.response) {
      console.error("Error del servidor:", error.response.data);
      showNotification(`Error: ${error.response.data.message}`, "error");
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
      showNotification("No se recibió respuesta del servidor.", "error");
    } else {
      console.error("Error al configurar la solicitud:", error.message);
      showNotification("Error en la solicitud.", "error");
    }
  };

  // 🔄 Obtener todas las categorías de WooCommerce
  const fetchCategories = async () => {
    try {
      setLoading(true);
      let page = 1;
      const perPage = 50; // Máximo permitido por la API
      let allCategories = [];
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await axios.get(
          "https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products/categories",
          {
            params: { page, per_page: perPage },
            headers: {
              Authorization:
                "Basic " +
                btoa(
                  "ck_e30921f40372c8a619867ee2ab3909358874fe13:cs_49ea34bf63b4112e99adb683cae30999ace1003c"
                ),
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

      console.log("Categorías obtenidas:", allCategories);
      setCategories(allCategories);
      setError(null);
    } catch (error) {
      setError("Error al cargar categorías.");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear una nueva categoría
  const createCategory = async (categoryName) => {
    try {
      const response = await axios.post(
        "https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products/categories",
        { name: categoryName },
        {
          headers: {
            Authorization:
              "Basic " +
              btoa(
                "ck_e30921f40372c8a619867ee2ab3909358874fe13:cs_49ea34bf63b4112e99adb683cae30999ace1003c"
              ),
            "Content-Type": "application/json",
          },
        }
      );

      setCategories((prevCategories) => [...prevCategories, response.data]);
      showNotification("Categoría creada con éxito.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  // ➕ Crear una subcategoría
  const createSubcategory = async (subcategoryName, parentId) => {
    try {
      if (!categories.some((cat) => cat.id === parentId)) {
        console.error("El ID de la categoría padre no es válido.");
        showNotification("El ID de la categoría padre no es válido.", "error");
        return;
      }

      const response = await axios.post(
        "https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products/categories",
        { name: subcategoryName, parent: parentId },
        {
          headers: {
            Authorization:
              "Basic " +
              btoa(
               "ck_e30921f40372c8a619867ee2ab3909358874fe13:cs_49ea34bf63b4112e99adb683cae30999ace1003c"
              ),
            "Content-Type": "application/json",
          },
        }
      );

      setCategories((prevCategories) => [...prevCategories, response.data]);
      showNotification("Subcategoría creada con éxito.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  // ❌ Eliminar una categoría
  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(
        `https://papayawhip-koala-105915.hostingersite.com/wp-json/wc/v3/products/categories/${categoryId}?force=true`,
        {
          headers: {
            Authorization:
              "Basic " +
              btoa(
               "ck_e30921f40372c8a619867ee2ab3909358874fe13:cs_49ea34bf63b4112e99adb683cae30999ace1003c"
              ),
          },
        }
      );

      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryId)
      );
      showNotification("Categoría eliminada con éxito.", "success");
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
