import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import {
  TrendingUp,
  Target,
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export function ProgressScreen() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const weeklyData = [
    { day: 'Mon', xp: 120, minutes: 30 },
    { day: 'Tue', xp: 150, minutes: 45 },
    { day: 'Wed', xp: 80, minutes: 20 },
    { day: 'Thu', xp: 200, minutes: 60 },
    { day: 'Fri', xp: 180, minutes: 50 },
    { day: 'Sat', xp: 250, minutes: 70 },
    { day: 'Sun', xp: 100, minutes: 25 },
  ];

  const skillsData = [
    { skill: 'Listening', score: 85 },
    { skill: 'Speaking', score: 72 },
    { skill: 'Pronunciation', score: 78 },
    { skill: 'Vocabulary', score: 90 },
    { skill: 'Grammar', score: 68 },
  ];

  const stats = {
    currentStreak: 12,
    longestStreak: 28,
    totalXP: 15420,
    level: 8,
    lessonsCompleted: 124,
    studyTime: 2340, // minutes
    accuracy: 84,
  };

  const weeklyGoal = {
    current: 1080,
    target: 1500,
    percentage: 72,
  };

  const recentAchievements = [
    { id: 1, title: '7 Day Streak', icon: Flame, color: 'text-orange-500' },
    { id: 2, title: 'Level 8 Reached', icon: Star, color: 'text-yellow-500' },
    { id: 3, title: '100 Lessons', icon: Trophy, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Progress</h1>
              <p className="text-purple-50">Keep up the great work!</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-sm text-purple-50">Day Streak</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalXP}</div>
                  <div className="text-sm text-purple-50">Total XP</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                  <div className="text-sm text-purple-50">Lessons Done</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.accuracy}%</div>
                  <div className="text-sm text-purple-50">Accuracy</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Weekly Goal */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-2xl">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Goal</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weeklyGoal.current} / {weeklyGoal.target} XP
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-lg px-4 py-2">
              {weeklyGoal.percentage}%
            </Badge>
          </div>
          <Progress value={weeklyGoal.percentage} className="h-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {weeklyGoal.target - weeklyGoal.current} XP to go!
          </p>
        </Card>

        {/* Time Range Selection */}
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            This Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            className={timeRange === 'year' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            This Year
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* XP Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              XP Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Study Time Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Study Time (minutes)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Skills Radar */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Skills Assessment
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
              >
                <div className={`p-3 bg-white dark:bg-gray-700 rounded-xl ${achievement.color}`}>
                  <achievement.icon className="h-6 w-6" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Milestones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Reach Level 10</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level 8/10</span>
                </div>
                <Progress value={80} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">30 Day Streak</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">12/30 days</span>
                </div>
                <Progress value={40} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Complete 200 Lessons</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">124/200</span>
                </div>
                <Progress value={62} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
