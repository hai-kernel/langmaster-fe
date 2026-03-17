import { Palette } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useThemeStore, BACKGROUND_OPTIONS, type BackgroundColorKey } from '@/store/themeStore';
import { cn } from '@/app/components/ui/utils';

const COLOR_SWATCHES: Record<BackgroundColorKey, string> = {
  slate: 'bg-slate-400',
  warm: 'bg-amber-400',
  blue: 'bg-sky-400',
  green: 'bg-emerald-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
  dark: 'bg-slate-700',
};

export function ThemeColorBar() {
  const { backgroundColor, setBackgroundColor } = useThemeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          title="Tuỳ chỉnh màu nền"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">Màu nền</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(BACKGROUND_OPTIONS) as BackgroundColorKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setBackgroundColor(key)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                backgroundColor === key && 'bg-violet-50 dark:bg-violet-950/50 ring-1 ring-violet-500/50'
              )}
              title={BACKGROUND_OPTIONS[key].label}
            >
              <span
                className={cn(
                  'h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm',
                  COLOR_SWATCHES[key],
                  backgroundColor === key && 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900'
                )}
              />
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate w-full text-center">
                {BACKGROUND_OPTIONS[key].label}
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
