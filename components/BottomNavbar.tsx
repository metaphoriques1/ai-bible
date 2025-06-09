
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../types';

interface BottomNavbarProps {
  navItems: NavItem[];
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ navItems }) => {
  const location = useLocation();

  // Ensure there are at most 5 items for optimal display
  const displayedNavItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-gray-200 shadow-t-lg z-40 print:hidden"> {/* Ensure z-index is below modals if any, hide on print */}
      <div className="flex justify-around items-stretch h-16"> {/* items-stretch for full height touch target */}
        {displayedNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-medium focus:outline-none focus:bg-brand-primary/10 transition-colors duration-150
              ${location.pathname === item.path 
                ? 'text-brand-primary' 
                : 'text-brand-text-secondary hover:text-brand-primary'
              }`}
            aria-current={location.pathname === item.path ? 'page' : undefined}
            style={{ WebkitTapHighlightColor: 'transparent' }} // Improve touch feedback on iOS
          >
            {React.cloneElement(item.icon, { className: 'w-6 h-6 mb-0.5' })}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;