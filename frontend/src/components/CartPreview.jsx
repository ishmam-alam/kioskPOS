import React, { useState } from 'react'
import QuantityModal from './QuantityModal'

const CartPreview = ({ cart, isVisible, onCheckout, total, discount = 0, disabled = false, onUpdateQuantity, remainingAmount = 0, totalCashReceived = 0, cardAmount = 0, changeAmount = 0, isPaymentComplete = false, showPayment = false }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  // Show all items including quantity 0, but only count active items for display
  const activeItems = cart.filter(item => item.quantity > 0);
  const discountedTotal = total * (1 - discount / 100);
  
  if (!isVisible && cart.length === 0) {
    return (
      //"bg-white rounded-lg border-2 border-gray-300 p-4 h-full flex flex-col"
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-300 p-4 h-full flex flex-col">
        <div className="flex justify-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          (0 item)
        </h2>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 flex items-center justify-center">
          <p className="text-gray-500 text-sm">
            Scan items to add them to your cart
          </p>
        </div>

        {/* Fixed Total Bar at Bottom - Always Visible */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-[rgb(var(--primary-light-text)/1)]">
              €{discountedTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-4 pr-6 h-full flex flex-col">
      <div className="flex justify-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          ({activeItems.length} {activeItems.length === 1 ? 'item' : 'items'})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {cart.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <div className="text-left min-w-8">
                  <button
                    onClick={() => {
                      if (!disabled && !showPayment && !isPaymentComplete) {
                        setCurrentItem(item)
                        setModalOpen(true)
                      }
                    }}
                    className={`font-semibold px-1 py-1 rounded transition-colors ${
                      disabled || showPayment || isPaymentComplete
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-[rgb(var(--primary-light-text)/1)] cursor-pointer hover:bg-gray-100'
                    }`}
                    title={disabled || showPayment || isPaymentComplete ? 'Cannot modify during payment' : 'Click to change quantity'}
                    disabled={disabled || showPayment || isPaymentComplete}
                  >
                    {item.quantity}x
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold line-clamp-2 ${item.quantity === 0 ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.name}
                  </h4>
                  {item.quantity > 1 && (
                    <p className={`text-sm ${item.quantity === 0 ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                      €{item.price.toFixed(2)} Einzelpreis
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right min-w-20">
                <p className={`font-semibold ${item.quantity === 0 ? 'text-gray-400 line-through' : 'text-[rgb(var(--primary-light-text)/1)]'}`}>
                  €{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
            {index < cart.length - 1 && (
              <div className="border-t border-gray-200"></div>
            )}
          </React.Fragment>
        ))}
        {discount > 0 && (
          <div className="flex justify-end py-2">
            <span className="text-xl font-bold italic text-gray-600">
              Discount: {discount}% ( - €{(total * discount / 100).toFixed(2)} )
            </span>
          </div>
        )}
      </div>

      {/* Fixed Total Bar at Bottom - Always Visible */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        {/* Show Total */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-800">Total:</span>
          <span className="text-2xl font-bold text-[rgb(var(--primary-light-text)/1)]">
            €{discountedTotal.toFixed(2)}
          </span>
        </div>

        {/* Show payment breakdown when payment is complete */}
        {isPaymentComplete && (totalCashReceived > 0 || cardAmount > 0) && (
          <div className="space-y-2 mb-2">
            {changeAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Change:</span>
                <span className="text-2xl font-bold text-green-600">
                  €{changeAmount.toFixed(2)}
                </span>
              </div>
            )}
            {totalCashReceived > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cash:</span>
                <span className="text-sm font-semibold text-blue-600">
                  €{totalCashReceived.toFixed(2)}
                </span>
              </div>
            )}
            {cardAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Card:</span>
                <span className="text-sm font-semibold text-gray-600">
                  €{cardAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Show Paid amount when payment is open and there's cash received */}
        {showPayment && totalCashReceived > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Paid:</span>
            <span className="text-lg font-bold text-blue-600">
              €{totalCashReceived.toFixed(2)}
            </span>
          </div>
        )}

        {/* Show remaining amount only when payment is open */}
        {showPayment && remainingAmount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-800">Remaining:</span>
            <span className="text-xl font-bold text-red-600">
              €{remainingAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Quantity Modal */}
      <QuantityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(newQuantity) => {
          if (currentItem && onUpdateQuantity) {
            onUpdateQuantity(currentItem.barcode, newQuantity)
          }
        }}
        currentQuantity={currentItem?.quantity || 1}
        itemName={currentItem?.name}
      />
    </div>
  )
}

export default CartPreview
