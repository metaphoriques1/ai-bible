import React from 'react';

interface MultiSelectTagsProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
  label?: string;
  className?: string;
}

const MultiSelectTags: React.FC<MultiSelectTagsProps> = ({
  availableTags,
  selectedTags,
  onChange,
  label,
  className = '',
}) => {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={`my-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagToggle(tag)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent
              ${selectedTags.includes(tag)
                ? 'bg-brand-accent text-brand-text-primary border-brand-accent-darker shadow-sm'
                : 'bg-brand-surface text-brand-text-secondary border-gray-300 hover:border-brand-accent hover:text-brand-accent'
              }`}
          >
            {selectedTags.includes(tag) && '✓ '}
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectTags;