'use client';
import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  'new': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'resolved': 'bg-green-100 text-green-800',
  'for-sale': 'bg-green-100 text-green-800',
  'for-rent': 'bg-gray-100 text-gray-800',
  'sold': 'bg-gray-100 text-gray-800',
  'published': 'bg-green-100 text-green-800',
  'draft': 'bg-yellow-100 text-yellow-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'sent': 'bg-gray-100 text-gray-800',
  'completed': 'bg-green-100 text-green-800',
  'featured': 'bg-amber-100 text-amber-800',
  'offplan': 'bg-purple-100 text-purple-800',
  'regular': 'bg-gray-100 text-gray-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${style} ${className}`}>{status}</span>
  );
};

export default StatusBadge; 