import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addItem = (product, count) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingItemIndex !== -1) {
                return prevCart.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, count: item.count + count }
                        : item
                );
            } else {
                return [...prevCart, { ...product, count }];
            }
        });
    };

    const removeItem = (itemId) => {
        setCart(prevCart => prevCart.filter(product => product.id !== itemId));
    };

    const totalCountProducts = () => cart.reduce((acc, item) => acc + item.count, 0);

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.precio * item.count, 0);
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
