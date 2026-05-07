// src/Contex/CartContex.js
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/* ========= Helpers ========= */
function getId(p) {
  return p?.id ?? p?._id ?? '';
}
function getUnitPrice(p) {
  // Mongo
  const sale = Number(p?.pricing?.sale ?? NaN);
  const list = Number(p?.pricing?.list ?? NaN);
  if (!Number.isNaN(sale)) return sale;
  if (!Number.isNaN(list)) return list;
  // Shopify (fallback)
  const v = p?.variants?.[0];
  if (v?.price != null) return Number(v.price);
  return 0;
}
/** Lee el stock con prioridad:
 * 1) p._maxStock (si lo guardamos al agregar)
 * 2) p.stock explícito
 * 3) variants[0].stock
 * 4) inventory[0].qty
 * 5) variants[0].inventory_quantity (Shopify)
 * Si nada existe, por defecto 1 (para NO pasarse).
 */
function getStock(p) {
  if (p?._maxStock != null) return Number(p._maxStock);
  if (p?.stock != null) return Number(p.stock);
  const v = p?.variants?.[0];
  if (v?.stock != null) return Number(v.stock);
  const inv = p?.inventory?.[0]?.qty;
  if (inv != null) return Number(inv);
  const s = p?.variants?.[0]?.inventory_quantity;
  if (s != null) return Number(s);
  return 1; // <<— cambia a Infinity si prefieres sin tope cuando no hay dato
}

export const CartProvider = ({ children }) => {
  // Cargar carrito
  const [cart, setCart] = useState(() => {
    try {
      const stored = sessionStorage.getItem('cart');
      const parsed = stored ? JSON.parse(stored) : [];
      // normaliza id
      return parsed.map(it => ({ ...it, id: getId(it) || it.id }));
    } catch {
      return [];
    }
  });

  // Persistir
  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    console.log('🛒 Carrito actualizado en sessionStorage:', cart);
  }, [cart]);

  /** Agregar item (guarda el stock efectivo y respeta tope) */
  const addItem = (product, count = 1) => {
    const normalizedId = getId(product);
    if (!normalizedId) {
      console.warn('Intento de agregar producto SIN ID. Ignorado:', product);
      return;
    }
    const safeCount = Number(count) > 0 ? Number(count) : 1;

    // calcular stock efectivo una sola vez y guardarlo en el item
    const effectiveStock =
      product?.stock ??
      product?.variants?.[0]?.stock ??
      product?.inventory?.[0]?.qty ??
      product?.variants?.[0]?.inventory_quantity ??
      1;

    setCart(prev => {
      const idx = prev.findIndex(i => i.id === normalizedId);
      if (idx !== -1) {
        const copy = [...prev];
        const current = copy[idx];
        const maxStock = getStock(current); // ya puede tener _maxStock
        const nextCount = Math.min((current.count || 0) + safeCount, maxStock);
        if (nextCount === (current.count || 0)) {
          alert(`Stock máximo alcanzado (${maxStock} unidades).`);
        }
        copy[idx] = { ...current, count: nextCount };
        return copy;
      }
      // nuevo item con _maxStock seteado
      const base = {
        ...product,
        id: normalizedId,
        count: Math.min(safeCount, effectiveStock),
        _maxStock: Number(effectiveStock), // <<— se usa primero en getStock()
      };
      return [...prev, base];
    });
  };

  /** Quitar item */
  const removeItem = (itemId) => {
    setCart(prev => prev.filter(p => p.id !== itemId));
  };

  /** Vaciar */
  const clearCart = () => setCart([]);

  /** +1 cantidad (respeta tope SIEMPRE) */
  const increaseQty = (anyId) => {
    setCart(prev =>
      prev.map(p => {
        if (p.id !== anyId) return p;
        const maxStock = getStock(p);
        const current = p.count || 1;
        if (current >= maxStock) {
          alert(`Stock máximo alcanzado (${maxStock} unidades).`);
          return p; // sin cambios
        }
        return { ...p, count: current + 1 };
      })
    );
  };

  /** -1 cantidad (mínimo 1) */
  const decreaseQty = (anyId) => {
    setCart(prev =>
      prev.map(p => {
        if (p.id !== anyId) return p;
        const next = Math.max((p.count || 1) - 1, 1);
        return { ...p, count: next };
      })
    );
  };

  /** Total líneas */
  const totalCountProducts = () => cart.length;

  /** Total $ */
  const getTotalPrice = () =>
    cart.reduce((acc, item) => acc + getUnitPrice(item) * (item.count || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        clearCart,
        increaseQty,
        decreaseQty,
        totalCountProducts,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
