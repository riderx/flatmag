import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  options: DropdownOption[];
  buttonContent: React.ReactNode;
  className?: string;
}

export function Dropdown({ options, buttonContent, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 300); // Delay before closing
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  return (
    <div 
      className={`relative ${className}`}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex">
        {buttonContent}
      </div>
      
      <div 
        className={`absolute bottom-full right-0 mb-2 w-48 transform transition-all duration-200 ${
          isOpen 
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 translate-y-1 invisible'
        }`}
      >
        <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 bg-white border-r border-b border-gray-200" />
      </div>
    </div>
  );
}