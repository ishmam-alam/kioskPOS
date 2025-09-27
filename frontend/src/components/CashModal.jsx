import React, { useState, useEffect } from 'react';

// Coins
import oneCentCoin from '../images/cashImages/oneCentCoin.png';
import twoCentCoin from '../images/cashImages/twoCentCoin.png';
import fiveCentCoin from '../images/cashImages/fiveCentCoin.png';
import tenCentCoin from '../images/cashImages/tenCentCoin.png';
import twentyCentCoin from '../images/cashImages/twentyCentCoin.png';
import fiftyCentCoin from '../images/cashImages/fiftyCentCoin.png';
import oneEuroCoin from '../images/cashImages/oneEuroCoin.png';
import twoEuroCoin from '../images/cashImages/twoEuroCoin.png';

// Notes
import fiveEuroNote from '../images/cashImages/fiveEuroNote.png';
import tenEuroNote from '../images/cashImages/tenEuroNote.png';
import twentyEuroNote from '../images/cashImages/twentyEuroNote.png';
import fiftyEuroNote from '../images/cashImages/fiftyEuroNote.png';
import oneHundredEuroNote from '../images/cashImages/oneHundredEuroNote.png';

const MAX_CASH_AMOUNT = 99999;

const CashModal = ({ isOpen, onClose, onConfirm, defaultAmount }) => {
  const [cashAmount, setCashAmount] = useState(0);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [isCentsMode, setIsCentsMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialAmount = Math.round(defaultAmount * 100);
      setCashAmount(initialAmount <= MAX_CASH_AMOUNT ? initialAmount : MAX_CASH_AMOUNT);
      setIsReplaceMode(true);
      setIsCentsMode(false);
    }
  }, [isOpen, defaultAmount]);

  const handleNumpadClick = (value) => {
    const digit = parseInt(value);

    if (value === 'Clear') {
      setCashAmount(0);
      setIsReplaceMode(false);
      setIsCentsMode(false);
    } else if (value === 'Backspace') {
      if (isCentsMode) {
        const euros = Math.floor(cashAmount / 100);
        let cents = Math.floor((cashAmount % 100) / 10); // remove last cent digit
        const newAmount = euros * 100 + cents;
        setCashAmount(newAmount);
      } else {
        setCashAmount(Math.floor(cashAmount / 10));
      }
      setIsReplaceMode(false);
    } else if (value === '00') {
      const newAmount = cashAmount * 100;
      if (newAmount <= MAX_CASH_AMOUNT) setCashAmount(newAmount);
      setIsReplaceMode(false);
      setIsCentsMode(false);
    } else if (value >= '0' && value <= '9') {
      if (isCentsMode) {
        const euros = Math.floor(cashAmount / 100);
        let cents = cashAmount % 100;

        // Ignore input if already 2 digits
        if (cents >= 10) return;

        // Append new digit
        cents = cents * 10 + digit;
        const newAmount = euros * 100 + cents;
        setCashAmount(newAmount <= MAX_CASH_AMOUNT ? newAmount : MAX_CASH_AMOUNT);

        // Exit cents mode after 2 digits
        if (cents >= 10) setIsCentsMode(false);
      } else if (isReplaceMode) {
        setCashAmount(digit <= MAX_CASH_AMOUNT ? digit : MAX_CASH_AMOUNT);
        setIsReplaceMode(false);
      } else {
        const newAmount = cashAmount * 10 + digit;
        if (newAmount <= MAX_CASH_AMOUNT) setCashAmount(newAmount);
      }
    }
  };

  const handleQuickAdd = (cents) => {
    if (isReplaceMode) {
      setCashAmount(cents <= MAX_CASH_AMOUNT ? cents : MAX_CASH_AMOUNT);
    } else {
      const newAmount = cashAmount + cents;
      if (newAmount <= MAX_CASH_AMOUNT) setCashAmount(newAmount);
    }
    setIsReplaceMode(false);
    setIsCentsMode(true); // enable cents-mode for next numpad inputs
  };

  const formatCashAmount = (cents) => {
    const euros = Math.floor(cents / 100);
    const centavos = cents % 100;
    return `${euros}.${centavos.toString().padStart(2, '0')}`;
  };

  const handleEnter = () => {
    if (cashAmount > MAX_CASH_AMOUNT) {
      alert('Maximum cash amount is €2000.00');
      return;
    }
    const amountInEuros = cashAmount / 100;
    if (amountInEuros >= 0) {
      onConfirm('cash', amountInEuros);
      onClose();
      setCashAmount(0);
      setIsReplaceMode(false);
      setIsCentsMode(false);
    } else {
      alert('Please enter a valid cash amount');
    }
  };

  if (!isOpen) return null;

  const coins = [
    { value: 200, img: twoEuroCoin },
    { value: 100, img: oneEuroCoin },
    { value: 50, img: fiftyCentCoin },
    { value: 20, img: twentyCentCoin },
    { value: 10, img: tenCentCoin },
    { value: 5, img: fiveCentCoin },
    { value: 2, img: twoCentCoin },
    { value: 1, img: oneCentCoin },
  ];

  const notes = [
    { value: 5, img: fiveEuroNote },
    { value: 10, img: tenEuroNote },
    { value: 20, img: twentyEuroNote },
    { value: 50, img: fiftyEuroNote },
    { value: 100, img: oneHundredEuroNote },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full flex flex-col shadow-xl">

        <h2 className="text-xl font-bold mb-4 text-center">Enter Cash Amount</h2>
        <div className="mb-4 text-2xl font-bold text-center bg-gray-50 border-2 border-gray-200 p-4 rounded">
          <span
            className={`${isReplaceMode ? 'bg-blue-500 text-white px-1 rounded' : 'text-gray-800'}`}
          >
            €{formatCashAmount(cashAmount)}
          </span>
        </div>

        <div className="flex gap-6">
          {/* Coins */}
          <div className="grid grid-cols-2 gap-3">
            {coins.map((coin) => (
              <button
                key={coin.value}
                onClick={() => handleQuickAdd(coin.value)}
                className="relative w-16 h-16 rounded-full overflow-hidden"
              >
                <img
                  src={coin.img}
                  alt={`€${(coin.value / 100).toFixed(2)}`}
                  className="w-full h-full object-contain rounded-full"
                />
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 flex-grow">
            {['7','8','9','4','5','6','1','2','3','00','0','Backspace'].map(btn => (
              <button
                key={btn}
                onClick={() => handleNumpadClick(btn)}
                className="p-3 bg-gray-200 rounded text-base font-semibold shadow"
              >
                {btn === 'Backspace' ? '⌫' : btn}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="flex flex-col-reverse gap-3">
            {notes.map((note) => (
              <button
                key={note.value}
                onClick={() => handleQuickAdd(note.value * 100)}
                className="relative w-24 h-14 shadow-lg overflow-hidden"
              >
                <img
                  src={note.img}
                  alt={`€${note.value}`}
                  className="w-full h-full object-contain rounded-md"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Back + C */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              onClose();
              setCashAmount(0);
              setIsReplaceMode(false);
              setIsCentsMode(false);
            }}
            className="flex-1 p-4 bg-gray-500 text-white rounded text-lg font-semibold shadow"
          >
            Back
          </button>
          <button
            onClick={() => {
              setCashAmount(0);
              setIsReplaceMode(false);
              setIsCentsMode(false);
            }}
            className="flex-1 p-4 bg-red-500 text-white rounded text-lg font-semibold shadow"
          >
            C
          </button>
        </div>

        {/* Enter */}
        <button
          onClick={handleEnter}
          className="w-full mt-4 py-6 bg-green-500 text-white rounded-lg font-extrabold text-2xl shadow"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default CashModal;
