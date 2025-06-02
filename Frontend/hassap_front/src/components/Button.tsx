import * as React from 'react';
import '../componentsStyles/Button.css';

type ButtonProps = {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  className = '' 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};