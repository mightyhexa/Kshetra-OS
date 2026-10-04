import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'highlight' | 'warning' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-[#E2E8F0] shadow-2xs',
    accent: 'bg-white border-[#CBD5E1] shadow-xs border-l-4 border-l-[#0B3D6E]',
    highlight: 'bg-[#F8FAFC] border-[#CBD5E1] shadow-2xs',
    warning: 'bg-[#FFFBEB] border-amber-300 shadow-2xs border-l-4 border-l-amber-500',
    danger: 'bg-[#FFF1F2] border-rose-300 shadow-2xs border-l-4 border-l-rose-500'
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-shadow duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between pb-3 mb-4 border-b border-[#F1F5F9] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`font-serif text-base font-semibold text-[#0F172A] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-3 text-sm text-[#334155] ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-3 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B] ${className}`} {...props}>
    {children}
  </div>
);
