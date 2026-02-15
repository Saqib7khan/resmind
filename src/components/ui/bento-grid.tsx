import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 'full' | 'half' | 'one';
  rowSpan?: 'single' | 'double';
}

export const BentoCard = ({
  children,
  className,
  colSpan = 'one',
  rowSpan = 'single',
}: BentoCardProps) => {
  const colSpanClass = {
    full: 'md:col-span-3',
    half: 'md:col-span-2',
    one: 'md:col-span-1',
  };

  const rowSpanClass = {
    single: 'md:row-span-1',
    double: 'md:row-span-2',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10',
        'bg-white/5 backdrop-blur-md',
        'p-6 transition-all duration-300',
        'hover:bg-white/10 hover:border-white/20',
        colSpanClass[colSpan],
        rowSpanClass[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
};
