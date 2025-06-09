import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../types';
import { APP_NAME } from '../constants';
import { LogoIcon } from './common/IconComponents'; // Changed to LogoIcon

interface NavbarProps {
  navItems: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ navItems }) => {
  const location = useLocation();

  return (
    <nav className="bg-brand-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center text-white">
            <LogoIcon className="h-8 w-8 mr-2 text-brand-accent" /> {/* Icon color uses accent, changed to LogoIcon */}
            <span className="font-display font-bold text-2xl tracking-tight">{APP_NAME}</span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2
                  ${location.pathname === item.path 
                    ? 'bg-brand-primary-darker text-white shadow-inner' 
                    : 'text-gray-300 hover:bg-brand-primary-darker/70 hover:text-white'
                  }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {/* The icon itself will receive className from its definition in App.tsx's navItems setup */}
                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          {/* Mobile menu button placeholder - BottomNav is primary for mobile */}
          <div className="md:hidden">
            {/* Could add a settings or profile icon here if needed for mobile top bar */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
