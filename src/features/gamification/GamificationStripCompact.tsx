import { Link } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/store/appStore';

export function GamificationStripCompact() {
  const user = useAppStore((s) => s.user);
  const level = user?.level ?? 1;
  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;

  const xpForNextLevel = (level + 1) * 250;
  const xpInCurrentLevel = xp % 250;
  const xpProgress = (xpInCurrentLevel / 250) * 100;

  return (
    <div className="hidden md:flex items-center gap-4">
      <Link
        to="/progress"
        className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white text-sm font-bold">
          {level}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{level}</span>
        </div>
      </Link>

      <div className="flex items-center gap-2 min-w-[120px]">
        <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Progress value={xpProgress} className="h-1.5" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{xp} / {xpForNextLevel} XP</p>
        </div>
      </div>

      <Link
        to="/achievements"
        className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
          streak > 0
            ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${streak > 0 ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-500'}`}>
          <Flame className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chuỗi</span>
          <span className={`text-xs font-bold ${streak > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {streak} ngày
          </span>
        </div>
      </Link>
    </div>
  );
}
