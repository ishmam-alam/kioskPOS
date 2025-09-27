import React, { useEffect, useRef } from 'react'
import CartPreview from './components/CartPreview'
import ScanArea from './components/ScanArea'
import Header from './components/Header'
import Footer from './components/Footer'
import Payment from './components/Payment'
import PaymentReport from './components/PaymentReport'
import CustomItemModal from './components/CustomItemModal'
import ErrorBoundary from './components/ErrorBoundary'
import { useCart } from './hooks/useCart'
import { usePayment } from './hooks/usePayment'
import { useProducts } from './hooks/useProducts'
import { useUI } from './hooks/useUI'
import { ERROR_MESSAGES } from './constants'

function App() {
  const barcodeInputRef = useRef(null)

  // Custom Hooks
  const cart = useCart()
  const payment = usePayment()
  const products = useProducts()
  const ui = useUI()



  const handleScan = (barcode) => {
    if (!barcode.trim()) return

    try {
      const product = products.getProduct(barcode)
      if (product) {
        cart.addProductToCart({ barcode, ...product })
        ui.showCart()
      } else {
        alert(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
      }
    } catch (error) {
      alert(error.message || ERROR_MESSAGES.GENERIC_ERROR)
    }

    // Clear input and refocus
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = ''
      barcodeInputRef.current.focus()
    }
  }

  const removeFromCart = (barcode) => {
    cart.removeFromCart(barcode)
    if (cart.getItemCount() === 0) {
      ui.hideCart()
    }
  }

  const updateQuantity = (barcode, newQuantity) => {
    try {
      cart.updateQuantity(barcode, newQuantity)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleCheckout = () => {
    if (cart.isEmpty()) return
    ui.openPayment()
  }

  const handleBackToScan = () => {
    ui.closePayment()
    // Keep payment state intact - don't reset totalCashReceived, remainingAmount, etc.
  }

  const handlePaymentComplete = (method = 'card', cash = 0) => {
    try {
      if (method === 'cash') {
        const result = payment.processCashPayment(cash, cart.getTotal())
        if (result.status === 'complete') {
          ui.closePayment()
          ui.openPaymentReport()
        }
      } else if (method === 'card') {
        payment.processCardPayment(cart.getTotal())
        ui.closePayment()
        ui.openPaymentReport()
      }
    } catch (error) {
      alert(error.message || ERROR_MESSAGES.PAYMENT_FAILED)
    }
  }

  const handleDiscountChange = (newDiscount) => {
    try {
      payment.applyDiscount(newDiscount)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAddCustomItem = (item) => {
    try {
      cart.addCustomItem(item)
      ui.showCart()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleBackToScanFromReport = () => {
    cart.clearCart()
    payment.resetPayment()
    ui.resetUI()
  }

  // Auto-focus on barcode input when component mounts
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  // Update remaining amount when cart or payment changes
  useEffect(() => {
    payment.updateRemainingAmount(cart.getTotal())
  }, [cart.cart, payment.discount, payment.totalCashReceived])

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gradient-to-br from-[rgb(var(--primary-light)/0.3)] to-[rgb(var(--primary-lighter)/0.3)] overflow-hidden relative">
        {/* Header */}
        <div className="pl-1 pr-1 flex-shrink-0">
          <ErrorBoundary>
            <Header isOnline={ui.isOnline} toggleOnlineStatus={ui.toggleOnlineStatus} />
          </ErrorBoundary>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex pl-1 pr-1 overflow-hidden">
        {/* Left Area - 65% width */}
        <div className="w-[65%] h-full">
          {ui.showPaymentReport ? (
            <PaymentReport
              cart={cart.cart}
              total={cart.getTotal()}
              discount={payment.discount}
              paymentMethod={payment.paymentMethod}
              cashAmount={payment.cashAmount}
              cardAmount={payment.cardAmount}
              totalCashReceived={payment.totalCashReceived}
              onBackToScan={handleBackToScanFromReport}
            />
          ) : ui.showPayment ? (
            <Payment
              cart={cart.cart}
              total={cart.getTotal()}
              discount={payment.discount}
              remainingAmount={payment.remainingAmount}
              totalCashReceived={payment.totalCashReceived}
              onBack={handleBackToScan}
              onComplete={handlePaymentComplete}
              onDiscountChange={handleDiscountChange}
            />
          ) : (
            <ScanArea
              onScan={handleScan}
              onOpenCustomItemModal={ui.openCustomItemModal}
              ref={barcodeInputRef}
              disabled={!ui.isOnline}
            />
          )}
        </div>

        {/* Cart Preview - 35% width */}
        <div className="w-[35%] h-full">
          <CartPreview
            cart={cart.cart}
            isVisible={ui.isCartVisible}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
            total={cart.getTotal()}
            discount={payment.discount}
            disabled={!ui.isOnline || ui.showPayment || ui.showPaymentReport}
            remainingAmount={payment.remainingAmount}
            totalCashReceived={payment.totalCashReceived}
            cardAmount={payment.cardAmount}
            changeAmount={payment.getChangeAmount(cart.getTotal())}
            showPayment={ui.showPayment}
            isPaymentComplete={ui.showPaymentReport}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pl-1 pr-1 flex-shrink-0">
        <Footer
          cart={cart.cart}
          total={cart.getTotal()}
          onCheckout={handleCheckout}
          disabled={!ui.isOnline}
          showPayment={ui.showPayment}
          showPaymentReport={ui.showPaymentReport}
        />
      </div>

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={ui.showCustomItemModal}
        onClose={ui.closeCustomItemModal}
        onAddItem={handleAddCustomItem}
      />

        {/* Offline Mask - covers everything except online/offline button */}
        {!ui.isOnline && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 z-40"></div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
