
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, name, id, containerClassName = '', className = '', ...props }) => {
  const textAreaId = id || name;
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={textAreaId} className="block text-sm font-medium text-brand-text-secondary mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        name={name}
        rows={4}
        className={`block w-full px-3 py-2.5 text-base text-brand-text-primary border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-base placeholder-brand-text-secondary/70 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default TextArea;
