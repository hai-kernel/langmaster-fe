import { Trophy, Flame, Star } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/store/appStore';
import { motion } from 'motion/react';

export function GamificationBar() {
  const { user } = useAppStore();
  const level = user?.level ?? 1;
  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const totalLessonsCompleted = user?.totalLessonsCompleted ?? 0;

  const xpToNextLevel = (level + 1) * 250;
  const xpProgress = (xp % 250) / 250 * 100;

  return (
    <Card className="p-5 rounded-3xl border-2 border-green-100 dark:border-green-900 shadow-sm">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Level */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-xl shadow-lg">
            {level}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cấp độ</p>
            <p className="font-bold text-lg text-green-600 dark:text-green-400">Level {level}</p>
          </div>
        </motion.div>

        {/* XP Progress */}
        <div className="flex-1 min-w-[200px]">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
              <Star className="h-4 w-4 text-yellow-500" />
              {xp} XP
            </span>
            <span className="text-gray-500 dark:text-gray-400">{xpToNextLevel} XP</span>
          </div>
          <Progress value={xpProgress} className="h-3 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Streak */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            streak > 0
              ? 'bg-gradient-to-br from-orange-400 to-orange-600'
              : 'bg-gray-200 dark:bg-gray-700'
          } shadow-md`}>
            <Flame className={`h-7 w-7 ${streak > 0 ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Chuỗi</p>
            <p className="font-bold text-lg text-orange-600 dark:text-orange-400">{streak} ngày</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-md">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hoàn thành</p>
            <p className="font-bold text-lg text-green-600 dark:text-green-400">{totalLessonsCompleted} bài</p>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}