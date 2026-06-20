import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  accentColor?: 'electric' | 'gold';
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false,
  accentColor = 'gold',
}: SectionHeadingProps) {
  const accentGradient =
    accentColor === 'gold'
      ? 'from-[#D4AF37] to-[#E0C35C]'
      : 'from-[#4A90E2] to-[#6BA4E8]';

  return (
    <div className={cn('mb-12', centered && 'text-center')}>
      <h2
        className={cn(
          'text-3xl sm:text-4xl font-bold tracking-tight mb-4',
          light ? 'text-white' : 'text-[#0A1929]'
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          'h-[3px] w-16 rounded-full bg-gradient-to-r mb-6',
          accentGradient,
          centered && 'mx-auto'
        )}
      />
      {subtitle && (
        <p
          className={cn(
            'text-lg max-w-2xl leading-relaxed',
            light ? 'text-gray-400' : 'text-[#2C3E50]',
            centered && 'mx-auto'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
