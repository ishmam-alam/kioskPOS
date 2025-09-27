import React from 'react';

const CardModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Confirm Card Payment</h2>
        <p className="text-center mb-6">Are you sure you want to proceed with card payment?</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm('card', 0);
              onClose();
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
