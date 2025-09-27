import { VALIDATION_RULES } from '../constants';

export const validateQuantity = (quantity) => {
  const num = parseInt(quantity);
  return !isNaN(num) && num >= VALIDATION_RULES.MIN_QUANTITY && num <= VALIDATION_RULES.MAX_QUANTITY;
};

export const validatePrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num >= VALIDATION_RULES.MIN_PRICE && num <= VALIDATION_RULES.MAX_PRICE;
};

export const validateDiscount = (discount) => {
  const num = parseFloat(discount);
  return !isNaN(num) && num >= VALIDATION_RULES.MIN_DISCOUNT && num <= VALIDATION_RULES.MAX_DISCOUNT;
};

export const validateBarcode = (barcode) => {
  return barcode && typeof barcode === 'string' && barcode.trim().length > 0;
};

export const formatCurrency = (amount, locale = 'de-DE', currency = 'EUR') => {
  // Always treat amount as euros (not cents)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatAmount = (cents) => {
  const euros = Math.floor(cents / 100);
  const centavos = cents % 100;
  return `${euros}.${centavos.toString().padStart(2, '0')}`;
};

export const calculateChange = (totalPaid, total) => {
  return Math.max(0, totalPaid - total);
};
