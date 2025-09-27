// Simple test to verify the Footer component logic
const testCart = [
  { barcode: '123', name: 'Item 1', price: 10.99, quantity: 0 },
  { barcode: '456', name: 'Item 2', price: 5.99, quantity: 2 }
];

const emptyCart = [
  { barcode: '123', name: 'Item 1', price: 10.99, quantity: 0 },
  { barcode: '456', name: 'Item 2', price: 5.99, quantity: 0 }
];

// Test the logic used in the Footer component
const hasActiveItems = (cart) => cart.filter(item => item.quantity > 0).length > 0;
const isDisabled = (cart, disabled) => disabled || cart.filter(item => item.quantity > 0).length === 0;

console.log('Test with items in cart:');
console.log('Has active items:', hasActiveItems(testCart));
console.log('Is disabled (false):', isDisabled(testCart, false));
console.log('Is disabled (true):', isDisabled(testCart, true));

console.log('\nTest with empty cart:');
console.log('Has active items:', hasActiveItems(emptyCart));
console.log('Is disabled (false):', isDisabled(emptyCart, false));
console.log('Is disabled (true):', isDisabled(emptyCart, true));

console.log('\nThe pay button should:');
console.log('- Always be visible');
console.log('- Be gray/inactive when cart is empty or disabled');
console.log('- Be colored/active when cart has items and not disabled');
