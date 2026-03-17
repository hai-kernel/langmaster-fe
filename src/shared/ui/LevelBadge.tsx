import { Badge } from '@/app/components/ui/badge';
import type { LevelType } from '@/types';

interface LevelBadgeProps {
  level: LevelType;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const config = {
    beginner: {
      label: 'Beginner',
      className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    intermediate: {
      label: 'Intermediate',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    advanced: {
      label: 'Advanced',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
  };

  const { label, className } = config[level];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
