import * as React from 'react';
import '../componentsStyles/Input.css';

type InputProps = {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string;  // Cambiado a opcional
  defaultValue?: string; // Nuevo prop para valores por defecto
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value = '', // Valor por defecto
  defaultValue,
  onChange,
  errorMessage,
  ref
}) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        ref={ref}
      />
      {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
    </div>
  );
};