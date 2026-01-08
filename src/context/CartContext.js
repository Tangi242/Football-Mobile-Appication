import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem('cart');
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  const saveCart = useCallback(async (items) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, []);

  const addToCart = useCallback((product, size = null, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size
      );

      let newItems;
      if (existingIndex >= 0) {
        // Update quantity if item already exists
        newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          price: product.discount
            ? Number(product.price) * (1 - Number(product.discount) / 100)
            : Number(product.price),
          originalPrice: Number(product.price),
          discount: Number(product.discount) || 0,
          size: size,
          quantity: quantity,
          category: product.category,
        };
        newItems = [...prev, newItem];
      }

      saveCart(newItems);
      return newItems;
    });
  }, [saveCart]);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item.id !== itemId);
      saveCart(newItems);
      return newItems;
    });
  }, [saveCart]);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      saveCart(newItems);
      return newItems;
    });
  }, [removeFromCart, saveCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCart([]);
  }, [saveCart]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Save order to history
  const saveOrder = useCallback(async (userId, orderData) => {
    try {
      const order = {
        id: `order_${Date.now()}`,
        date: new Date().toISOString(),
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'pending', // pending, confirmed, shipped, delivered
        ...orderData,
      };

      const storedOrders = await AsyncStorage.getItem(`orders_${userId}`);
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      orders.unshift(order); // Add to beginning
      
      // Keep only last 50 orders
      const limitedOrders = orders.slice(0, 50);
      await AsyncStorage.setItem(`orders_${userId}`, JSON.stringify(limitedOrders));
      
      return order;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        saveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

