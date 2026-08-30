import React, { useId } from 'react';
import '../../styles/components.css';
export default function Input({ label, error, className = '', id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} className="input-field" {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}