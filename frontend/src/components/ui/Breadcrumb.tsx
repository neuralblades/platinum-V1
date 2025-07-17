'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  darkMode?: boolean;
}

const Breadcrumb = ({ items, className = '', darkMode = false }: BreadcrumbProps) => {
  const textColor = darkMode ? 'text-white' : 'text-gray-600';
  const hoverColor = darkMode ? 'hover:text-gray-300' : 'hover:text-gray-900';
  const separatorColor = darkMode ? 'text-gray-400' : 'text-gray-400';
  const activeColor = darkMode ? 'text-gray-300' : 'text-gray-900';

  return (
    <nav className={`flex text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <span className={`mx-2 ${separatorColor}`}>/</span>}
            
            {item.href && index !== items.length - 1 ? (
              <Link 
                href={item.href} 
                className={`${textColor} ${hoverColor} transition duration-300`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={activeColor}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
