import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'saffron';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D6E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#0B3D6E] hover:bg-[#072A4D] text-white border border-transparent shadow-xs',
    secondary: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0]',
    danger: 'bg-[#E11D48] hover:bg-[#BE123C] text-white border border-transparent shadow-xs',
    ghost: 'bg-transparent hover:bg-[#F1F5F9] text-[#0F172A]',
    outline: 'bg-white hover:bg-[#F8FAFC] text-[#0B3D6E] border border-[#CBD5E1] shadow-2xs',
    saffron: 'bg-[#E8731A] hover:bg-[#C25E10] text-white border border-transparent shadow-xs'
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 min-h-[30px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[38px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]'
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
