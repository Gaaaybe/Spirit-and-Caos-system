import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'normal' | 'lg';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '',
  padding = 'normal',
  hover = false,
  ...props 
}: CardProps) {
  const baseClasses = "bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg dark:shadow-gray-900/70";
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  };
  
  const hoverClass = hover ? 'hover:shadow-2xl hover:shadow-espirito-500/10 hover:scale-[1.02] hover:border-espirito-400/50 dark:hover:border-espirito-600/50 transition-all duration-300 hover:-translate-y-1' : '';
  
  return (
    <div 
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardChildProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ children, className = '' }: CardChildProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardChildProps) {
  return (
    <h3 className={`text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }: CardChildProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardChildProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
