import { cn } from '@/app/components/ui/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  const raw = Math.min(100, Math.max(0, value));
  const percentage = Math.round(raw);

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {percentage}% hoàn thành
        </p>
      )}
    </div>
  );
}