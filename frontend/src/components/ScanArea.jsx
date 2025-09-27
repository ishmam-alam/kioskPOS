import React, { forwardRef } from 'react'

const ScanArea = forwardRef(({ onScan, onOpenCustomItemModal, disabled = false }, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const barcode = ref.current?.value.trim()
    if (barcode) {
      onScan(barcode)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const barcode = ref.current?.value.trim()
      if (barcode) {
        onScan(barcode)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 pl-4 px-6 h-full flex flex-col">
      <div className="text-center flex-1">
        <div className="w-20 h-20 mx-auto mb-6 bg-[rgb(var(--primary-light)/0.2)] rounded-full flex items-center justify-center scan-pulse">
          <svg 
            className="w-10 h-10 text-[rgb(var(--primary-light-text)/1)]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Scan Item to Begin
        </h2>
        
        <p className="text-gray-600 mb-6">
          Position barcode in front of the scanner or enter manually
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <input
              ref={ref}
              type="text"
              placeholder="Enter barcode or scan item..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary-light-text)/1)] focus:border-transparent text-center text-lg font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-5 h-5 text-gray-400 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                onClick={() => {
                  const barcode = ref.current?.value.trim()
                  if (barcode) {
                    onScan(barcode)
                  }
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCustomItemModal}
            className="mt-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Add Custom Item
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Test Barcodes:
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>123456789012 - Coca-Cola 330ml (€1.50)</div>
            <div>234567890123 - Lays Classic Chips (€2.00)</div>
            <div>345678901234 - Snickers Bar (€1.25)</div>
            <div>456789012345 - Bottled Water 500ml (€1.00)</div>
            <div>567890123456 - Apple (€0.75)</div>
          </div>
        </div>
      </div>
    </div>
  )
})

ScanArea.displayName = 'ScanArea'

export default ScanArea
