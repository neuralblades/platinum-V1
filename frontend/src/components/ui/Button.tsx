'use client';

import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'mj' | 'wht';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  gradient?: boolean;
  href?: string;
  className?: string;
  isLoading?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  gradient = true,
  href,
  className = '',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: gradient
      ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold shadow-lg focus:ring-gray-700'
      : 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700',
    secondary: gradient
      ? 'bg-gradient-to-r from-[#767d8f] to-[#5e6476] hover:from-[#5e6476] hover:to-[#4a4f5d] text-white font-bold shadow-lg focus:ring-[#767d8f]'
      : 'bg-[#767d8f] hover:bg-[#5e6476] text-white focus:ring-[#767d8f]',
    accent: gradient
      ? 'bg-gradient-to-r from-[#9599a7] to-[#777b8a] hover:from-[#777b8a] hover:to-[#5f6271] text-white font-bold shadow-lg focus:ring-[#9599a7]'
      : 'bg-[#9599a7] hover:bg-[#777b8a] text-white focus:ring-[#9599a7]',
    mj: gradient
      ? 'bg-gradient-to-r from-gray-500 to-gray-900 hover:from-gray-900 hover:to-gray-500 text-white font-bold shadow-lg focus:ring-gray-700'
      : 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    outline: 'border border-gray-700 bg-transparent text-gray-700 font-bold shadow-lg hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    wht: 'bg-gray-100 text-gray-900 font-bold shadow-lg border border-gray-300 hover:bg-gray-50'
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Disabled classes
  const disabledClasses = (disabled || isLoading)
    ? 'opacity-60 cursor-not-allowed'
    : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
