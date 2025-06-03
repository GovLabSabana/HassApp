import * as React from 'react';
import '../componentsStyles/Button.css';

type ButtonProps = {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset'; // Nueva prop
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  className = '',
  type = 'button' // Valor por defecto
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      type={type} // Pasar el type al elemento button nativo
    >
      {children}
    </button>
  );
};