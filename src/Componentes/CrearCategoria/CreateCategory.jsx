import React, { useState } from 'react';
import { useCategories } from '../Contex/CategoriesContext'; // Importar el hook de contexto

const CreateCategory = () => {
  const { createCategory, createSubcategory, deleteCategory, categories } = useCategories();
  
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState(0);

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (categoryName) {
      createCategory(categoryName);
      setCategoryName('');
    }
  };

  const handleSubcategorySubmit = (e) => {
    e.preventDefault();
    if (subcategoryName && parentCategoryId) {
      createSubcategory(subcategoryName, parentCategoryId);
      setSubcategoryName('');
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      deleteCategory(categoryId); // Elimina la categoría seleccionada
    }
  };

  return (
    <div>
      <h2>Crear Categoría</h2>
      
      {/* Formulario para crear categoría */}
      <form onSubmit={handleCategorySubmit}>
        <div>
          <label>Nombre de la categoría</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear Categoría</button>
      </form>

      {/* Formulario para crear subcategoría */}
      <h3>Crear Subcategoría</h3>
      <form onSubmit={handleSubcategorySubmit}>
        <div>
          <label>Nombre de la subcategoría</label>
          <input
            type="text"
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Selecciona una categoría principal</label>
          <select
            value={parentCategoryId}
            onChange={(e) => setParentCategoryId(parseInt(e.target.value))}
            required
          >
            <option value={0}>Selecciona una categoría principal</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Crear Subcategoría</button>
      </form>

      {/* Listar categorías existentes con opción de eliminar */}
      <h3>Categorías Existentes</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.name}
            <button onClick={() => handleDeleteCategory(cat.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateCategory;
