import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-150', className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-4', className)} {...props} />
    );
  }
);
CardContent.displayName = 'CardContent';
