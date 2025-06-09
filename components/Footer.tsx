
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-brand-text-primary text-brand-background/70 py-8"> {/* Dark bg, light text */}
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
        <p className="text-sm mt-1">Your personal AI discipleship coach.</p>
      </div>
    </footer>
  );
};

export default Footer;
