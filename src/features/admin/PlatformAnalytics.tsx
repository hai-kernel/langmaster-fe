import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
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
  AreaChart,
  Area,
} from 'recharts';

export function PlatformAnalytics() {
  const userGrowthData = [
    { month: 'Jul', students: 120, teachers: 8, total: 128 },
    { month: 'Aug', students: 245, teachers: 12, total: 257 },
    { month: 'Sep', students: 380, teachers: 15, total: 395 },
    { month: 'Oct', students: 520, teachers: 18, total: 538 },
    { month: 'Nov', students: 680, teachers: 22, total: 702 },
    { month: 'Dec', students: 850, teachers: 25, total: 875 },
    { month: 'Jan', students: 1020, teachers: 28, total: 1048 },
  ];

  const engagementData = [
    { day: 'Mon', activeUsers: 780, lessons: 1250, tests: 340 },
    { day: 'Tue', activeUsers: 820, lessons: 1380, tests: 380 },
    { day: 'Wed', activeUsers: 750, lessons: 1180, tests: 320 },
    { day: 'Thu', activeUsers: 890, lessons: 1520, tests: 420 },
    { day: 'Fri', activeUsers: 920, lessons: 1680, tests: 450 },
    { day: 'Sat', activeUsers: 680, lessons: 980, tests: 280 },
    { day: 'Sun', activeUsers: 620, lessons: 890, tests: 250 },
  ];

  const revenueData = [
    { month: 'Jul', revenue: 12500 },
    { month: 'Aug', revenue: 15800 },
    { month: 'Sep', revenue: 18200 },
    { month: 'Oct', revenue: 21600 },
    { month: 'Nov', revenue: 24800 },
    { month: 'Dec', revenue: 28200 },
    { month: 'Jan', revenue: 31500 },
  ];

  const stats = {
    totalUsers: 1048,
    activeUsers: 892,
    totalLessons: 8680,
    avgSessionTime: 24.5,
    revenue: 31500,
    growth: 12.3,
    completionRate: 87.5,
    satisfaction: 4.7,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Analytics</h1>
              <p className="text-orange-50">Comprehensive insights and metrics</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-orange-50">Total Users</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <div className="text-sm text-orange-50">Active Users</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalLessons}</div>
                  <div className="text-sm text-orange-50">Lessons Completed</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                  <div className="text-sm text-orange-50">Monthly Revenue</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Additional Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  +{stats.growth}%
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              vs last month
            </Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-2xl">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgSessionTime} min
                </div>
              </div>
            </div>
            <Badge variant="outline">per user</Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-2xl">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </div>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Excellent
            </Badge>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-3 rounded-2xl">
                <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Satisfaction</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.satisfaction}/5.0
                </div>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              ⭐ High rating
            </Badge>
          </Card>
        </div>

        {/* User Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            User Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Daily Active Users
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Lessons & Tests Completed
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="lessons" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tests" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Revenue */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
