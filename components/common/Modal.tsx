
import React, { Fragment, useEffect } from 'react';
import { XMarkIcon } from './IconComponents'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to reset overflow when component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md', // Default max-width for sm screens and up
    lg: 'sm:max-w-lg md:max-w-lg lg:max-w-2xl', // Adjusted for better scaling
    xl: 'sm:max-w-xl md:max-w-2xl lg:max-w-4xl',
    full: 'h-full max-w-full', // Takes full width and specified height
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out p-4" // Added padding for small screens
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-brand-surface rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && <h3 id="modal-title" className="text-lg font-semibold text-brand-primary">{title}</h3>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;