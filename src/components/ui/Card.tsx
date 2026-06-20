import { cn } from '@/lib/utils';

interface CardProps {
  variant?: 'default' | 'dark' | 'featured';
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
  noPadding?: boolean;
  id?: string;
}

const variantStyles = {
  default:
    'bg-white border border-gray-200 shadow-sm',
  dark:
    'bg-[#0D2137] border border-white/10',
  featured:
    'bg-[#0D2137] border border-white/10 border-t-2 border-t-[#D4AF37]',
};

export default function Card({
  variant = 'default',
  className,
  children,
  hoverable = true,
  noPadding = false,
  id,
}: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-xl transition-all duration-300 overflow-hidden',
        !noPadding && 'p-6',
        variantStyles[variant],
        hoverable && 'hover:-translate-y-1 hover:shadow-xl',
        hoverable && variant === 'default' && 'hover:shadow-gray-200/50',
        hoverable && variant !== 'default' && 'hover:shadow-[#4A90E2]/10 hover:border-white/20',
        className
      )}
    >
      {children}
    </div>
  );
}
