import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Verifica si el carrito se actualiza correctamente
    useEffect(() => {
        console.log("🛒 Carrito actualizado:", cart);
    }, [cart]);  // Se ejecuta cada vez que cambia el carrito

    const addItem = (product, count) => {
        console.log("📩 Producto recibido en addItem:", product);
        console.log("📦 Carrito antes de agregar:", cart);

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
    
            let updatedCart;
            if (existingItem) {
                console.log("🔄 Producto ya en el carrito, sumando cantidad.");
                updatedCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, count: item.count + count }
                        : item
                );
            } else {
                console.log("🆕 Producto nuevo, agregándolo al carrito.");
                updatedCart = [...prevCart, { ...product, count }];
            }
    
            console.log("📦 Carrito después de agregar:", updatedCart);
            return updatedCart;
        });
    };

    const removeItem = (itemId) => {
        setCart(prevCart => prevCart.filter(product => product.id !== itemId));
    };

    const totalCountProducts = () => cart.length; // Solo contar productos únicos en el carrito


    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
          const precio = parseFloat(item.variants[0]?.price) || 0; // Asegúrate de que el precio sea un número
          const cantidad = item.count || 0; // Asegúrate de que la cantidad sea un número
          return total + precio * cantidad;
        }, 0);
      };
      
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addItem, removeItem, totalCountProducts, getTotalPrice, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
