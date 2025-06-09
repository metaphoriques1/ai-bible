
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string } | string>;
  containerClassName?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, error, name, id, options, containerClassName = '', className = '', placeholder, ...props }) => {
  const selectId = id || name;
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-brand-text-secondary mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={`block w-full pl-3 pr-10 py-2.5 text-base text-brand-text-primary border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-base rounded-md ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => {
          const value = typeof option === 'string' ? option : option.value;
          const displayLabel = typeof option === 'string' ? option : option.label;
          return (
            <option key={value + '-' + index} value={value}>
              {displayLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
