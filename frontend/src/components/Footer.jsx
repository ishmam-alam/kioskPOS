import React from 'react';

const Footer = ({ cart = [], total = 0, onCheckout, disabled = false, showPayment = false, showPaymentReport = false }) => {
  const demoButtons = [
    { id: 1, label: 'Demo 1', action: () => console.log('Demo 1 clicked') },
    { id: 2, label: 'Demo 2', action: () => console.log('Demo 2 clicked') },
    { id: 3, label: 'Demo 3', action: () => console.log('Demo 3 clicked') },
    { id: 4, label: 'Demo 4', action: () => console.log('Demo 4 clicked') },
    { id: 5, label: 'Demo 5', action: () => console.log('Demo 5 clicked') }
  ];

  return (
    <footer className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center px-1 py-1">
        {/* Demo buttons on the left */}
        <div className="flex space-x-1 ">
          {demoButtons.map((button) => (
            <button
              key={button.id}
              onClick={button.action}
              className="w-20 h-20 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled || showPayment || showPaymentReport}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Pay button on the right - matches CartPreview width (35%) */}
        <div className="w-[35%]" >
          <button
            onClick={onCheckout}
            className={`w-full h-20 font-semibold px-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              cart.filter(item => item.quantity > 0).length > 0 && !disabled && !showPayment && !showPaymentReport
                ? 'bg-green-600 hover:bg-green-500 cursor-pointer text-white'
                : 'bg-green-200 cursor-not-allowed text-green-600'
            }`}
            disabled={disabled || showPayment || showPaymentReport || cart.filter(item => item.quantity > 0).length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {disabled ? 'Pay' : 'Pay'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
