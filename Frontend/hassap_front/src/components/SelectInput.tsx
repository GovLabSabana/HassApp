import * as React from 'react';
import '../componentsStyles/Input.css';

type Option = {
  value: string | number;
  label: string;
};

type SelectInputProps = {
  label: string;
  value?: string | number;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  errorMessage?: string;
  name?: string;
};

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  options,
  onChange,
  errorMessage,
  name
}) => {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        <option value="">Seleccione una opción</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
    </div>
  );
};