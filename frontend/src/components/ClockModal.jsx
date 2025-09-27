import React, { useState } from 'react';

const ClockModal = ({ currentTime, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(currentTime);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = selectedDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const selectMonth = (monthIndex) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setShowMonthDropdown(false);
  };

  const selectYear = (year) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearDropdown(false);
  };

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const startingDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDate = new Date(year, month, 1 - i);
      days.unshift({
        date: prevMonthDate,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDate,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          {/* Date and Time Display */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {currentTime.toLocaleTimeString('en-GB', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-lg text-gray-600">
              {currentTime.toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Month and Year Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    className="text-lg font-semibold text-gray-800 px-2 py-1 hover:bg-gray-200 rounded"
                  >
                    {months[selectedDate.getMonth()]}
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {months.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => selectMonth(index)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className="text-lg font-semibold text-gray-800 px-2 py-1 hover:bg-gray-200 rounded"
                  >
                    {selectedDate.getFullYear()}
                  </button>
                  {showYearDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {years.map(year => (
                        <button
                          key={year}
                          onClick={() => selectYear(year)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Weekday headers */}
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {generateCalendarDays(selectedDate).map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 rounded cursor-pointer ${
                    day.isCurrentMonth
                      ? day.isToday
                        ? 'bg-[rgb(var(--primary-dark)/1)] text-white'
                        : 'text-gray-800 hover:bg-gray-200'
                      : 'text-gray-400'
                  } ${day.isToday ? 'font-bold' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[rgb(var(--primary-dark)/1)] hover:bg-[rgb(var(--primary-darker)/1)] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ClockModal;
