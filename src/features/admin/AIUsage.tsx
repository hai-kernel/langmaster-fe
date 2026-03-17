import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  MessageSquare,
  Mic,
  Brain,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function AIUsage() {
  const usageData = [
    { day: 'Mon', requests: 1250, cost: 45 },
    { day: 'Tue', requests: 1380, cost: 52 },
    { day: 'Wed', requests: 980, cost: 38 },
    { day: 'Thu', requests: 1520, cost: 58 },
    { day: 'Fri', requests: 1680, cost: 63 },
    { day: 'Sat', requests: 2100, cost: 78 },
    { day: 'Sun', requests: 1450, cost: 55 },
  ];

  const serviceData = [
    { name: 'Speech Recognition', value: 45, color: '#3b82f6' },
    { name: 'AI Conversation', value: 30, color: '#10b981' },
    { name: 'Pronunciation Check', value: 15, color: '#8b5cf6' },
    { name: 'Content Generation', value: 10, color: '#f59e0b' },
  ];

  const stats = {
    totalRequests: 10360,
    totalCost: 389,
    avgResponseTime: 1.2,
    successRate: 98.5,
    monthlyQuota: 50000,
    monthlyBudget: 2000,
  };

  const usagePercentage = (stats.totalRequests / stats.monthlyQuota) * 100;
  const budgetPercentage = (stats.totalCost / stats.monthlyBudget) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Usage & Analytics</h1>
              <p className="text-purple-50">Monitor AI services usage and costs</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-purple-50">API Requests</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">${stats.totalCost}</div>
                  <div className="text-sm text-purple-50">Total Cost</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
                  <div className="text-sm text-purple-50">Avg Response</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <div className="text-sm text-purple-50">Success Rate</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Quota Usage */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-2xl">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Monthly Quota
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.totalRequests.toLocaleString()} / {stats.monthlyQuota.toLocaleString()} requests
                  </p>
                </div>
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  usagePercentage > 80
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : usagePercentage > 50
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {usagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={usagePercentage} className="h-3" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-2xl">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Monthly Budget
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${stats.totalCost} / ${stats.monthlyBudget}
                  </p>
                </div>
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  budgetPercentage > 80
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : budgetPercentage > 50
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {budgetPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={budgetPercentage} className="h-3" />
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Weekly Requests
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Weekly Costs ($)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Service Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            AI Services Distribution
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {serviceData.map((service) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.value}%
                      </span>
                    </div>
                    <Progress value={service.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            AI Services Details
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Speech Recognition
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Requests:</span>
                  <span className="font-semibold">4,662</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-semibold">$175</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                  <span className="font-semibold">0.8s</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  AI Conversation
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Requests:</span>
                  <span className="font-semibold">3,108</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-semibold">$117</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                  <span className="font-semibold">1.5s</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Pronunciation Check
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Requests:</span>
                  <span className="font-semibold">1,554</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-semibold">$58</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                  <span className="font-semibold">1.2s</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
