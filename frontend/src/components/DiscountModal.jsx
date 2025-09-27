import React, { useState, useEffect, useRef } from 'react';

const DiscountModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentDiscount = 0,
  maxDigits = 3
}) => {
  const [inputValue, setInputValue] = useState(currentDiscount.toString());
  const [isValid, setIsValid] = useState(true);
  const [isReplaceMode, setIsReplaceMode] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentDiscount.toString());
      setIsValid(true);
      setIsReplaceMode(true);
      // Focus and position cursor at end when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
  }, [isOpen, currentDiscount]);

  const handleNumberClick = (number) => {
    if (inputValue.length >= maxDigits && !isReplaceMode) return;

    let newValue;
    if (isReplaceMode) {
      // Replace mode: start fresh with the clicked number
      newValue = number.toString();
      setIsReplaceMode(false); // Switch to append mode after first input
    } else {
      // Append mode: add to existing value
      newValue = inputValue === '0' ? number.toString() : inputValue + number;
    }

    setInputValue(newValue);
    validateInput(newValue);

    // Focus and position cursor at end after number click
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  const handleBackspace = () => {
    if (inputValue.length === 1) {
      setInputValue('0');
      validateInput('0');
      setIsReplaceMode(true); // Reset to replace mode when back to single digit
    } else if (inputValue.length > 1) {
      const newValue = inputValue.slice(0, -1);
      setInputValue(newValue);
      validateInput(newValue);
    }

    // Focus and position cursor at end after backspace
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  const handleClear = () => {
    setInputValue('0');
    validateInput('0');
    setIsReplaceMode(true); // Reset to replace mode when cleared

    // Focus and position cursor at end after clear
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  const validateInput = (value) => {
    const numValue = parseInt(value, 10);
    setIsValid(numValue >= 0 && numValue <= 100);
  };

  const handleConfirm = () => {
    const discount = parseInt(inputValue, 10);
    if (discount >= 0 && discount <= 100) {
      onConfirm(discount);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Apply Discount
          </h3>
          <p className="text-gray-600 text-sm">
            Enter discount percentage (0-100%)
          </p>
        </div>

        {/* Discount Display */}
        <div className="text-center mb-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value === '' || parseInt(value) <= 100) {
                  setInputValue(value || '0');
                  validateInput(value || '0');
                  // Switch to append mode if user types more than one character
                  if (value.length > 1) {
                    setIsReplaceMode(false);
                  }
                }
              }}
              className={`text-4xl font-bold mb-2 w-full text-center bg-transparent border-none outline-none ${
                isValid ? 'text-gray-800' : 'text-red-500'
              }`}
              onFocus={(e) => {
                // Always move cursor to the end of the input
                const length = e.target.value.length;
                e.target.setSelectionRange(length, length);
              }}
            />
            <span className="absolute right-0 top-0 text-4xl font-bold text-gray-800">%</span>
          </div>
          {!isValid && (
            <p className="text-red-500 text-sm">
              Please enter a valid discount (0-100%)
            </p>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className="bg-gray-100 text-gray-800 font-semibold py-4 px-4 rounded-lg transition-colors text-xl"
              disabled={inputValue.length >= maxDigits}
            >
              {number}
            </button>
          ))}

          {/* Clear Button (Left) */}
          <button
            onClick={handleClear}
            className="bg-red-100 text-red-700 font-semibold py-4 px-4 rounded-lg transition-colors"
          >
            C
          </button>

          {/* Zero Button (Middle) */}
          <button
            onClick={() => handleNumberClick(0)}
            className="bg-gray-100 text-gray-800 font-semibold py-4 px-4 rounded-lg transition-colors text-xl"
            disabled={inputValue.length >= maxDigits}
          >
            0
          </button>

          {/* Backspace Button (Right) */}
          <button
            onClick={handleBackspace}
            className="bg-gray-200 text-gray-800 font-semibold py-4 px-4 rounded-lg transition-colors"
          >
            ⌫
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex-1 bg-[rgb(var(--primary-dark)/1)] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
