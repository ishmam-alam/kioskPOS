import { useState, useEffect, useCallback } from 'react';

export const useUI = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentReport, setShowPaymentReport] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isManualOverride) {
        setIsOnline(true);
      }
    };

    const handleOffline = () => {
      if (!isManualOverride) {
        setIsOnline(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isManualOverride]);

  const toggleOnlineStatus = useCallback(() => {
    setIsOnline(prev => !prev);
    setIsManualOverride(true);
  }, []);

  const showCart = useCallback(() => {
    setIsCartVisible(true);
  }, []);

  const hideCart = useCallback(() => {
    setIsCartVisible(false);
  }, []);

  const openPayment = useCallback(() => {
    setShowPayment(true);
  }, []);

  const closePayment = useCallback(() => {
    setShowPayment(false);
  }, []);

  const openPaymentReport = useCallback(() => {
    setShowPaymentReport(true);
  }, []);

  const closePaymentReport = useCallback(() => {
    setShowPaymentReport(false);
  }, []);

  const openCustomItemModal = useCallback(() => {
    setShowCustomItemModal(true);
  }, []);

  const closeCustomItemModal = useCallback(() => {
    setShowCustomItemModal(false);
  }, []);

  const resetUI = useCallback(() => {
    setIsCartVisible(false);
    setShowPayment(false);
    setShowPaymentReport(false);
    setShowCustomItemModal(false);
  }, []);

  return {
    isCartVisible,
    isOnline,
    showPayment,
    showPaymentReport,
    showCustomItemModal,
    toggleOnlineStatus,
    showCart,
    hideCart,
    openPayment,
    closePayment,
    openPaymentReport,
    closePaymentReport,
    openCustomItemModal,
    closeCustomItemModal,
    resetUI
  };
};
