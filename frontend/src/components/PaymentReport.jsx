import React from 'react';
import { formatCurrency } from '../utils/validation';

const PaymentReport = ({ cart = [], total = 0, discount = 0, paymentMethod = 'card', cashAmount = 0, cardAmount = 0, totalCashReceived = 0, onBackToScan }) => {
  const activeItems = cart.filter(item => item.quantity > 0);
  const paymentDate = new Date().toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="bg-gradient-to-br from-[rgb(var(--primary-light)/0.3)] to-[rgb(var(--primary-lighter)/0.3)] p-4 h-full flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your transaction has been completed</p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Transaction Details</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{paymentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Amount:</span>
              <span className="font-medium">€{(total * (1 - discount / 100)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {paymentMethod === 'card' ? 'Credit/Debit Card' :
                 paymentMethod === 'cash' ? 'Cash' :
                 'Cash + Card'}
              </span>
            </div>
            {paymentMethod === 'card' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Card:</span>
                <span className="font-medium">€{cardAmount.toFixed(2)}</span>
              </div>
            )}
            {paymentMethod === 'cash' && totalCashReceived > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cash:</span>
                <span className="font-medium">€{totalCashReceived.toFixed(2)}</span>
              </div>
            )}
            {paymentMethod === 'mixed' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash:</span>
                  <span className="font-medium">€{totalCashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Card:</span>
                  <span className="font-medium">€{cardAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Change Section - Highlighted */}
        {paymentMethod === 'cash' && totalCashReceived > 0 && (
          <div className="mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-2">Change</h2>
              <div className="text-4xl font-bold text-green-600">
                €{Math.max(0, totalCashReceived - (total * (1 - discount / 100))).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Cash Received: €{totalCashReceived.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Back to Scan Button */}
        <button
          onClick={onBackToScan}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Scan
        </button>
      </div>
    </div>
  );
};

export default PaymentReport;
