import { useState, useCallback } from 'react';
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  const addProductToCart = useCallback((product) => {
    if (!product || !product.barcode) {
      throw new Error(ERROR_MESSAGES.INVALID_BARCODE);
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.barcode === product.barcode);

      if (existingItem) {
        return prevCart.map(item =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const addCustomItem = useCallback((item) => {
    if (!item.name || !item.price || item.price <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_PRICE);
    }

    if (!item.quantity || item.quantity < VALIDATION_RULES.MIN_QUANTITY) {
      throw new Error(ERROR_MESSAGES.INVALID_QUANTITY);
    }

    const customItem = {
      ...item,
      barcode: `custom_${Date.now()}`, // Generate unique barcode for custom items
      isCustom: true
    };

    setCart(prevCart => [...prevCart, customItem]);
  }, []);

  const removeFromCart = useCallback((barcode) => {
    setCart(prevCart => prevCart.filter(item => item.barcode !== barcode));
  }, []);

  const updateQuantity = useCallback((barcode, newQuantity) => {
    if (newQuantity < 0) {
      throw new Error(ERROR_MESSAGES.INVALID_QUANTITY);
    }

    if (newQuantity === 0) {
      removeFromCart(barcode);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.barcode === barcode
          ? { ...item, quantity: Math.min(newQuantity, VALIDATION_RULES.MAX_QUANTITY) }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getActiveItems = useCallback(() => {
    return cart.filter(item => item.quantity > 0);
  }, [cart]);

  const getItemCount = useCallback(() => {
    return getActiveItems().length;
  }, [getActiveItems]);

  const isEmpty = useCallback(() => {
    return getItemCount() === 0;
  }, [getItemCount]);

  return {
    cart,
    addProductToCart,
    addCustomItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getActiveItems,
    getItemCount,
    isEmpty
  };
};
