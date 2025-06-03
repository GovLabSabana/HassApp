import * as React from 'react';
import '../componentsStyles/Input.css';

type FileInputProps = {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  name?: string;
  accept?: string;
};

export const FileInput: React.FC<FileInputProps> = ({
  label,
  onChange,
  errorMessage,
  name,
  accept
}) => {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <input type="file" name={name} onChange={onChange} accept={accept} />
      {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
    </div>
  );
};