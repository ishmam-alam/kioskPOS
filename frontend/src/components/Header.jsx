import React, { useState, useEffect } from 'react';
import ClockModal from './ClockModal';

const Header = ({ isOnline, toggleOnlineStatus }) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[rgb(var(--primary-dark)/1)] to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Kista Blasta Shorbot</h1>
              <p className="text-xs text-gray-600">Treff Bangla - Bangladeshi Food Festival, Südwall, Krefeld</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSupportModal(true)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img 
                src="/src/images/logo.png" 
                alt="Company Logo" 
                className="w-8 h-8 object-contain"
              />
            </button>
            
            <button 
              onClick={toggleOnlineStatus}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors border cursor-pointer relative z-50 ${
                isOnline 
                  ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isOnline ? 'bg-white' : 'bg-white'
              }`}></div>
              <span className="text-xs font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
            
            <button 
              onClick={() => setShowClockModal(true)}
              className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {currentTime.toLocaleTimeString('en-GB', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </button>
          </div>
        </div>
      </header>

      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              {/* Logo first */}
              <img 
                src="/src/images/logo.png" 
                alt="Company Logo" 
                className="w-24 h-24 mx-auto mb-6 object-contain"
              />
              
              {/* Technical support call text - blue box with white box inside */}
              <div className="mb-8">
                <div className="bg-[rgb(var(--primary-dark)/1)] p-6 rounded-xl shadow-lg mb-4">
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    TECHNICAL SUPPORT
                  </h3>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-5xl font-extrabold text-[#1B3366]">
                      123-456-789
                    </div>
                    <p className="text-sm text-[rgb(var(--primary-light-text)/1)] text-center mt-6">
                      Only for emergency technical support. For inquiries, please contact our main office.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Company details */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Blasta Kassen System
              </h2>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">123 Main Street, City Center</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">+49 123 456 7890</span>
                </div>
              </div>
              
              {/* Round printer button under company details */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    // This will be handled by backend later
                    console.log("Print functionality to be implemented in backend");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 p-4 rounded-full transition-colors flex items-center justify-center"
                >
                  <img 
                    src="/src/images/printer.png" 
                    alt="Printer" 
                    className="w-8 h-8 object-contain"
                  />
                </button>
              </div>
            </div>
            
            {/* Close button on next line full width */}
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full bg-[rgb(var(--primary-dark)/1)] hover:bg-[rgb(var(--primary-darker)/1)] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showClockModal && (
        <ClockModal 
          currentTime={currentTime}
          onClose={() => setShowClockModal(false)}
        />
      )}
    </>
  )
}

export default Header
