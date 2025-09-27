export const ERROR_MESSAGES = {
  INVALID_BARCODE: 'Invalid barcode. Please scan a valid item.',
  PRODUCT_NOT_FOUND: 'Product not found. Please check the barcode.',
  INVALID_QUANTITY: 'Quantity must be a positive number.',
  INVALID_PRICE: 'Price must be a positive number.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
};

export const VALIDATION_RULES = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  MIN_PRICE: 0.01,
  MAX_PRICE: 9999.99,
  MAX_DISCOUNT: 100,
  MIN_DISCOUNT: 0
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card'
};

export const MODAL_TYPES = {
  CASH: 'cash',
  CARD: 'card',
  DISCOUNT: 'discount',
  QUANTITY: 'quantity',
  CUSTOM_ITEM: 'custom_item'
};
