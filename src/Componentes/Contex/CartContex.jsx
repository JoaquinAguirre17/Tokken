import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 🔄 Cargar desde sessionStorage al iniciar
  const [cart, setCart] = useState(() => {
    const storedCart = sessionStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // 💾 Guardar carrito en sessionStorage cada vez que cambie
  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    console.log('🛒 Carrito actualizado en sessionStorage:', cart);
  }, [cart]);

const addItem = (product, count = 1) => {
  setCart(prevCart => {
    const existingItem = prevCart.find(item => item.id === product.id);
    if (existingItem) {
      // Si el producto ya existe, suma la cantidad, asegurando que nunca sea undefined
      return prevCart.map(item =>
        item.id === product.id
          ? { ...item, count: (item.count || 0) + (count || 1) }
          : item
      );
    } else {
      // Si no existe, lo agrega con count (por defecto 1)
      return [...prevCart, { ...product, count: count || 1 }];
    }
  });
};
  const removeItem = (itemId) => {
    setCart(prevCart => prevCart.filter(product => product.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };
  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(p => {
        const stock = p.variants[0]?.inventory_quantity || 0;
        if (p.id === id && p.count < stock) {
          return { ...p, count: p.count + 1 };
        }
        return p;
      })
    );
  };
  

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(p =>
        p.id === id && p.count > 1 ? { ...p, count: p.count - 1 } : p
      )
    );
  };

  const totalCountProducts = () => cart.length;

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const precio = parseFloat(item.variants[0]?.price) || 0;
      const cantidad = item.count || 0;
      return total + precio * cantidad;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        totalCountProducts,
        getTotalPrice,
        clearCart,
        decreaseQty,
        increaseQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
