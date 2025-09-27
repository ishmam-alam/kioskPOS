import { useState, useCallback } from 'react';
import { ERROR_MESSAGES } from '../constants';

// Sample product data - in a real app, this would come from an API
const SAMPLE_PRODUCTS = {
  '123456789012': { name: 'Coca-Cola 330ml', price: 1.50 },
  '234567890123': { name: 'Lays Classic Chips', price: 2.00 },
  '345678901234': { name: 'Snickers Bar', price: 1.25 },
  '456789012345': { name: 'Bottled Water 500ml', price: 1.00 },
  '567890123456': { name: 'Apple', price: 0.75 }
};

export const useProducts = () => {
  const [products] = useState(SAMPLE_PRODUCTS);

  const getProduct = useCallback((barcode) => {
    if (!barcode || typeof barcode !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_BARCODE);
    }

    const product = products[barcode.trim()];
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }, [products]);

  const getAllProducts = useCallback(() => {
    return Object.entries(products).map(([barcode, product]) => ({
      barcode,
      ...product
    }));
  }, [products]);

  const searchProducts = useCallback((query) => {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const searchTerm = query.toLowerCase();
    return getAllProducts().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.barcode.includes(searchTerm)
    );
  }, [getAllProducts]);

  const validateBarcode = useCallback((barcode) => {
    return barcode && typeof barcode === 'string' && barcode.trim().length > 0;
  }, []);

  return {
    getProduct,
    getAllProducts,
    searchProducts,
    validateBarcode
  };
};
