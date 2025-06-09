
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string; 
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleClassName = '', actions }) => {
  return (
    <div className={`bg-brand-surface rounded-lg shadow-lg p-4 sm:p-6 ${className}`}>
      {title && (
        <div className={`mb-4 pb-2 ${actions ? 'flex justify-between items-center border-b border-brand-primary/10' : 'border-b border-brand-primary/10'}`}>
          <h3 className={`text-xl font-semibold text-brand-primary ${titleClassName}`}>{title}</h3>
          {actions && <div className="ml-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
