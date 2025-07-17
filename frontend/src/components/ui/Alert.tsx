import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const typeStyles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-gray-50 text-gray-800 border-gray-200',
};

export default function Alert({ type = 'info', children, className = '' }: AlertProps) {
  return (
    <div
      className={`mb-4 p-4 rounded-md border ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
} 