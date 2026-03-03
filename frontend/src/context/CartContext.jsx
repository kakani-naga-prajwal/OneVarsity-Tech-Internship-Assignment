import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.data || []);
    } catch (e) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Re-fetch cart when auth state changes - handled via event listener
    const onAuth = () => fetchCart();
    window.addEventListener('auth-login', onAuth);
    window.addEventListener('auth-logout', () => setCart([]));

    return () => {
      window.removeEventListener('auth-login', onAuth);
      window.removeEventListener('auth-logout', () => setCart([]));
    };
  }, []);

  const addToCart = async (productIdOrObj, quantity = 1) => {
    try {
      // Determine product ID depending on argument type
      const productId = typeof productIdOrObj === 'object' && productIdOrObj !== null
        ? productIdOrObj.id
        : productIdOrObj;

      const res = await api.post('/cart', { product_id: productId, quantity });
      if (res.data && res.data.data) {
        setCart(res.data.data);
      } else {
        await fetchCart();
      }
      return { success: true, data: cart };
    } catch (e) {
      console.warn('Backend add to cart failed, using offline demo cart', e);
      // Fallback to demoCart in localStorage when backend is unavailable
      try {
        const demoCartRaw = localStorage.getItem('demoCart');
        const demoCart = demoCartRaw ? JSON.parse(demoCartRaw) : [];
        const productId = typeof productIdOrObj === 'object' ? productIdOrObj.id : productIdOrObj;
        const existing = demoCart.find((it) => it.id === productId);
        if (existing) {
          existing.quantity = (existing.quantity || 0) + quantity;
        } else {
          demoCart.push({
            id: productId,
            Product: typeof productIdOrObj === 'object' ? productIdOrObj : null,
            quantity,
          });
        }
        localStorage.setItem('demoCart', JSON.stringify(demoCart));
        setCart(demoCart);
        return { success: true, data: demoCart };
      } catch (fallbackErr) {
        console.error('Demo cart fallback also failed', fallbackErr);
        return { success: false, data: cart };
      }
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await api.put(`/cart/${cartItemId}`, { quantity });
      if (res.data && res.data.data) {
        // According to API docs, might return array or item removed
        if (Array.isArray(res.data.data)) {
          setCart(res.data.data);
        } else {
          await fetchCart();
        }
      } else {
        await fetchCart();
      }
      return { success: true, data: cart };
    } catch (e) {
      console.error('Update quantity failed, using offline fallback', e);
      // Fallback: update demoCart in localStorage when backend is unavailable
      try {
        const demoCartRaw = localStorage.getItem('demoCart');
        const demoCart = demoCartRaw ? JSON.parse(demoCartRaw) : [];
        const item = demoCart.find((it) => it.id === cartItemId);
        if (item) {
          if (quantity > 0) {
            item.quantity = quantity;
          } else {
            // Remove item if quantity is 0 or negative
            const idx = demoCart.indexOf(item);
            demoCart.splice(idx, 1);
          }
          localStorage.setItem('demoCart', JSON.stringify(demoCart));
          setCart(demoCart);
          return { success: true, data: demoCart };
        }
      } catch (fallbackErr) {
        console.error('Demo cart quantity update also failed', fallbackErr);
      }
      return { success: false, data: cart };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
      return { success: true };
    } catch (e) {
      console.error('Remove from cart failed', e);
      return { success: false };
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.quantity || 0) * Number(item.Product?.price || item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
