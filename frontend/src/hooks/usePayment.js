import { useState, useCallback } from 'react';

export const usePayment = () => {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [totalCashReceived, setTotalCashReceived] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const applyDiscount = useCallback((newDiscount) => {
    setDiscount(Math.max(0, Math.min(100, newDiscount)));
  }, []);

  const calculateDiscountedTotal = useCallback((total) => {
    return total * (1 - discount / 100);
  }, [discount]);

  const processCashPayment = useCallback((amount, total) => {
    const newTotalCash = totalCashReceived + amount;
    setTotalCashReceived(newTotalCash);
    setCashAmount(amount);
    setPaymentMethod('cash');

    const discountedTotal = calculateDiscountedTotal(total);
    const totalPaid = newTotalCash + cardAmount;
    const change = Math.max(0, totalPaid - discountedTotal);

    return {
      status: totalPaid >= discountedTotal ? 'complete' : 'partial',
      change: change,
      remaining: Math.max(0, discountedTotal - totalPaid)
    };
  }, [totalCashReceived, cardAmount, calculateDiscountedTotal]);

  const processCardPayment = useCallback((amount) => {
    setCardAmount(amount);
    setPaymentMethod('card');
  }, []);

  const resetPayment = useCallback(() => {
    setDiscount(0);
    setPaymentMethod('card');
    setCashAmount(0);
    setCardAmount(0);
    setTotalCashReceived(0);
    setRemainingAmount(0);
  }, []);

  const getChangeAmount = useCallback((total) => {
    const discountedTotal = calculateDiscountedTotal(total);
    const totalPaid = totalCashReceived + cardAmount;
    return Math.max(0, totalPaid - discountedTotal);
  }, [calculateDiscountedTotal, totalCashReceived, cardAmount]);

  const updateRemainingAmount = useCallback((total) => {
    const discountedTotal = calculateDiscountedTotal(total);
    const paidAmount = totalCashReceived + cardAmount;
    setRemainingAmount(Math.max(0, discountedTotal - paidAmount));
  }, [calculateDiscountedTotal, totalCashReceived, cardAmount]);

  return {
    discount,
    paymentMethod,
    cashAmount,
    cardAmount,
    totalCashReceived,
    remainingAmount,
    applyDiscount,
    calculateDiscountedTotal,
    processCashPayment,
    processCardPayment,
    resetPayment,
    getChangeAmount,
    updateRemainingAmount
  };
};
