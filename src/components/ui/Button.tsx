import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}

const variantStyles = {
  primary:
    'bg-[#4A90E2] text-white hover:bg-[#6BA4E8] hover:shadow-lg hover:shadow-[#4A90E2]/25 active:bg-[#3A7BD0]',
  secondary:
    'border-2 border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white active:bg-[#3A7BD0]',
  gold:
    'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1929] active:bg-[#E0C35C]',
  ghost:
    'text-gray-300 hover:text-white hover:bg-white/5 active:bg-white/10',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  disabled = false,
  loading = false,
  children,
  className,
  onClick,
  type = 'button',
  id,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1929]',
    variantStyles[variant],
    sizeStyles[size],
    (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} id={id}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      id={id}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
