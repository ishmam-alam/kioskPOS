import React, { useState } from 'react';
import DiscountModal from './DiscountModal';
import CardModal from './CardModal';
import CashModal from './CashModal';

const Payment = ({
  cart = [],
  total = 0,
  discount = 0,
  remainingAmount = 0,
  totalCashReceived = 0,
  onBack,
  onComplete,
  onDiscountChange,
}) => {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  const activeItems = cart.filter((item) => item.quantity > 0);
  const discountedTotal = total * (1 - discount / 100);



  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 pl-4 px-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Demo Buttons */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
          <button
            onClick={() => setShowDiscountModal(true)}
            className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg transition-colors font-semibold"
          >
            Discount ({discount}%)
          </button>
          <button
            onClick={() => console.log('Demo 2 clicked')}
            className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg transition-colors font-semibold flex items-center justify-center"
          >
            Demo 2
          </button>
          <button
            onClick={() => console.log('Demo 3 clicked')}
            className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg transition-colors font-semibold flex items-center justify-center"
          >
            Demo 3
          </button>
        </div>

        {/* Payment Buttons */}
        <div className="flex justify-center gap-6 w-full">
          <button
            disabled={total <= 0}
            className={`aspect-[3/4] w-40 font-bold text-xl rounded-lg transition-colors flex items-center justify-center shadow-lg ${
              total <= 0
                ? 'bg-green-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white'
            }`}
            onClick={total > 0 ? () => setShowCardModal(true) : undefined}
          >
            Card
          </button>

          <button
            disabled={total <= 0}
            className={`aspect-[3/4] w-40 font-bold text-xl rounded-lg transition-colors flex items-center justify-center shadow-lg ${
              total <= 0
                ? 'bg-green-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white'
            }`}
            onClick={total > 0 ? () => setShowCashModal(true) : undefined}
          >
            Cash
          </button>
        </div>
      </div>

      {/* Back to Scan */}
      <div className="flex justify-end mt-6 mb-4">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold text-lg"
        >
          Back to Scan
        </button>
      </div>

      {/* Discount Modal */}
      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onConfirm={onDiscountChange}
        currentDiscount={discount}
      />

      {/* Card Modal */}
      <CardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onConfirm={onComplete}
      />

      {/* Cash Modal */}
      <CashModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        onConfirm={onComplete}
        defaultAmount={remainingAmount > 0 ? remainingAmount : discountedTotal}
      />

    </div>
  );
};

export default Payment;
