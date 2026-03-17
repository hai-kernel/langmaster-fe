import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Trophy,
  Award,
  Star,
  Flame,
  Target,
  Zap,
  Crown,
  Medal,
  Lock,
  Sparkles,
  TrendingUp,
  BookOpen,
  Mic,
  Volume2,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  category: 'streak' | 'lessons' | 'skill' | 'special' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export function AchievementsScreen() {
  const [activeCategory, setActiveCategory] = useState<'all' | Achievement['category']>('all');
  const [showLocked, setShowLocked] = useState(true);

  const achievements: Achievement[] = [
    {
      id: '1',
      title: '7 Day Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      category: 'streak',
      rarity: 'common',
      unlocked: true,
      unlockedAt: '2026-01-10',
      xpReward: 100,
    },
    {
      id: '2',
      title: 'Century Club',
      description: 'Complete 100 lessons',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      category: 'lessons',
      rarity: 'rare',
      unlocked: true,
      unlockedAt: '2026-01-14',
      xpReward: 250,
    },
    {
      id: '3',
      title: 'Pronunciation Pro',
      description: 'Get 95%+ accuracy on 20 pronunciation exercises',
      icon: Mic,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      category: 'skill',
      rarity: 'epic',
      progress: 15,
      maxProgress: 20,
      unlocked: false,
      xpReward: 500,
    },
    {
      id: '4',
      title: 'Speed Demon',
      description: 'Complete a lesson in under 5 minutes',
      icon: Zap,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      category: 'special',
      rarity: 'rare',
      unlocked: true,
      unlockedAt: '2026-01-08',
      xpReward: 200,
    },
    {
      id: '5',
      title: 'Legendary Learner',
      description: 'Reach Level 50',
      icon: Crown,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      category: 'special',
      rarity: 'legendary',
      progress: 8,
      maxProgress: 50,
      unlocked: false,
      xpReward: 2000,
    },
    {
      id: '6',
      title: 'Listening Master',
      description: 'Score 90%+ on 30 listening exercises',
      icon: Volume2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      category: 'skill',
      rarity: 'epic',
      progress: 22,
      maxProgress: 30,
      unlocked: false,
      xpReward: 500,
    },
    {
      id: '7',
      title: 'Perfect Week',
      description: 'Complete all daily goals for 7 consecutive days',
      icon: Star,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      category: 'streak',
      rarity: 'rare',
      unlocked: true,
      unlockedAt: '2026-01-12',
      xpReward: 300,
    },
    {
      id: '8',
      title: 'Early Bird',
      description: 'Complete 10 lessons before 9 AM',
      icon: Sparkles,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      category: 'special',
      rarity: 'common',
      progress: 7,
      maxProgress: 10,
      unlocked: false,
      xpReward: 150,
    },
    {
      id: '9',
      title: '30 Day Legend',
      description: 'Maintain a 30-day learning streak',
      icon: Flame,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      category: 'streak',
      rarity: 'legendary',
      progress: 12,
      maxProgress: 30,
      unlocked: false,
      xpReward: 1000,
    },
  ];

  const categories = [
    { id: 'all' as const, label: 'All', icon: Trophy },
    { id: 'streak' as const, label: 'Streaks', icon: Flame },
    { id: 'lessons' as const, label: 'Lessons', icon: BookOpen },
    { id: 'skill' as const, label: 'Skills', icon: Target },
    { id: 'special' as const, label: 'Special', icon: Sparkles },
  ];

  const rarityColors = {
    common: 'border-gray-400 text-gray-700 dark:text-gray-300',
    rare: 'border-blue-500 text-blue-700 dark:text-blue-400',
    epic: 'border-purple-500 text-purple-700 dark:text-purple-400',
    legendary: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
  };

  const filteredAchievements = achievements.filter((achievement) => {
    const categoryMatch = activeCategory === 'all' || achievement.category === activeCategory;
    const lockedMatch = showLocked || achievement.unlocked;
    return categoryMatch && lockedMatch;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlocked).length,
    totalXP: achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
    completion: Math.round(
      (achievements.filter((a) => a.unlocked).length / achievements.length) * 100
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Achievements</h1>
              <p className="text-yellow-50">Your learning milestones and rewards</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">
                    {stats.unlocked}/{stats.total}
                  </div>
                  <div className="text-sm text-yellow-50">Unlocked</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.completion}%</div>
                  <div className="text-sm text-yellow-50">Complete</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalXP}</div>
                  <div className="text-sm text-yellow-50">XP Earned</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">
                    {achievements.filter((a) => a.unlocked && a.rarity === 'legendary').length}
                  </div>
                  <div className="text-sm text-yellow-50">Legendary</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category.id)}
              className={`gap-2 ${
                activeCategory === category.id ? 'bg-yellow-500 hover:bg-yellow-600' : ''
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Show Locked Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant={showLocked ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLocked(!showLocked)}
            className={showLocked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            {showLocked ? 'Hide Locked' : 'Show Locked'}
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAchievements.length} achievements
          </span>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 transition-all duration-300 ${
                achievement.unlocked
                  ? 'hover:shadow-xl border-2'
                  : 'opacity-60 hover:opacity-80'
              } ${achievement.unlocked ? rarityColors[achievement.rarity] : ''}`}
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`${achievement.bgColor} p-4 rounded-2xl ${
                    achievement.unlocked ? '' : 'grayscale'
                  }`}
                >
                  {achievement.unlocked ? (
                    <achievement.icon className={`h-8 w-8 ${achievement.iconColor}`} />
                  ) : (
                    <Lock className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize ${rarityColors[achievement.rarity]}`}
                >
                  {achievement.rarity}
                </Badge>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {achievement.description}
              </p>

              {/* Progress */}
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <Progress
                    value={(achievement.progress / (achievement.maxProgress || 1)) * 100}
                  />
                </div>
              )}

              {/* Reward & Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">+{achievement.xpReward} XP</span>
                </div>
                {achievement.unlocked && achievement.unlockedAt && (
                  <span className="text-gray-500 dark:text-gray-500 text-xs">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                <Trophy className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No achievements found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try changing your filter settings
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
