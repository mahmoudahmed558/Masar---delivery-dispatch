import React from 'react';
import '../../styles/components.css';
export default function Button({ children, variant = 'primary', className = '', type, ...props }) {
  return (
    <button type={type || 'button'} className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}