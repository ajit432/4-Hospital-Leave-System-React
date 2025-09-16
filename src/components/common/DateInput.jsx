import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const DateInput = forwardRef(({
  label,
  error,
  className = '',
  required = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    setIsOpen(true);
    // Focus the actual input to show the native date picker
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  };

  const handleCalendarClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={(node) => {
            inputRef.current = node;
            if (ref) {
              if (typeof ref === 'function') {
                ref(node);
              } else {
                ref.current = node;
              }
            }
          }}
          type="date"
          className={clsx(
            'input pr-10 cursor-pointer',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          onClick={handleInputClick}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={handleCalendarClick}
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;
