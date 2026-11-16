/**
 * [FRONTEND STATE MANAGEMENT: React Context & Array Algorithms]
 * 
 * Why React Context?
 * Instead of passing cart data through props across 10 different components ("prop drilling"),
 * CartContext provides a single global state accessible anywhere via useCart().
 * 
 * DSA & Functional Array Methods used:
 * - find(): O(N) lookup to check if product is already in cart.
 * - map(): O(N) transformation to update item quantity without mutating original state.
 * - filter(): O(N) deletion to remove an item by ID.
 * - reduce(): O(N) accumulator to calculate total price and item count.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart state (isolated per tab in sessionStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tomat_cart') || localStorage.getItem('tomat_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync cart changes to tab-isolated sessionStorage
  useEffect(() => {
    sessionStorage.setItem('tomat_cart', JSON.stringify(cartItems));
  }, [cartItems]);


  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        const updatedQty = Math.min(existing.quantity + qty, product.stock_quantity);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: updatedQty } : item
        );
      }
      const initialQty = Math.min(qty, product.stock_quantity);
      return [...prevItems, { ...product, quantity: initialQty }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const clampedQty = Math.min(newQty, item.stock_quantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('tomat_cart');
    localStorage.removeItem('tomat_cart');
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price_per_unit * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
