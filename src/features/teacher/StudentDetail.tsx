import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Flame,
  Zap,
  Target,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Loader2,
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
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/services/apiService';

type StudentInfo = {
  id: string;
  name: string;
  email: string;
  class: string;
  level: number;
  xp: number;
  progress: number;
  streak: number;
  accuracy: number;
  lastActive: string;
  enrolledAt: string;
  status: string;
};

export function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    apiService.user.getAllUsers()
      .then((res) => {
        const list = (res.data?.data ?? []) as any[];
        const arr = Array.isArray(list) ? list : [];
        const user = arr.find((u: any) => String(u.id) === String(studentId));
        if (user) {
          setStudent({
            id: String(user.id),
            name: user.fullName || user.name || user.email || `User ${user.id}`,
            email: user.email || '—',
            class: user.className || '—',
            level: user.level ?? 0,
            xp: user.xp ?? 0,
            progress: user.progress ?? 0,
            streak: user.streak ?? 0,
            accuracy: user.accuracy ?? 0,
            lastActive: user.lastActive || '—',
            enrolledAt: user.enrolledAt || '—',
            status: user.status || 'active',
          });
        } else {
          setStudent({
            id: studentId,
            name: `Học viên #${studentId}`,
            email: '—',
            class: '—',
            level: 0,
            xp: 0,
            progress: 0,
            streak: 0,
            accuracy: 0,
            lastActive: '—',
            enrolledAt: '—',
            status: 'active',
          });
        }
      })
      .catch(() => {
        setStudent({
          id: studentId,
          name: `Học viên #${studentId}`,
          email: '—',
          class: '—',
          level: 0,
          xp: 0,
          progress: 0,
          streak: 0,
          accuracy: 0,
          lastActive: '—',
          enrolledAt: '—',
          status: 'active',
        });
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const progressData = [
    { week: 'W1', xp: 180, accuracy: 82 },
    { week: 'W2', xp: 220, accuracy: 85 },
    { week: 'W3', xp: 160, accuracy: 79 },
    { week: 'W4', xp: 280, accuracy: 88 },
    { week: 'W5', xp: 320, accuracy: 90 },
    { week: 'W6', xp: 290, accuracy: 87 },
  ];

  const recentActivities = [
    {
      type: 'lesson',
      title: 'Pronunciation Practice - TH Sounds',
      score: 92,
      date: '2026-01-16',
      status: 'completed',
    },
    {
      type: 'test',
      title: 'Vocabulary Quiz - Unit 3',
      score: 85,
      date: '2026-01-15',
      status: 'completed',
    },
    {
      type: 'lesson',
      title: 'AI Conversation - At Restaurant',
      score: 78,
      date: '2026-01-14',
      status: 'completed',
    },
    {
      type: 'lesson',
      title: 'Video Lesson - Daily Routines',
      score: 0,
      date: '2026-01-13',
      status: 'in-progress',
    },
  ];

  const skillsData = [
    { skill: 'Listening', score: 85 },
    { skill: 'Speaking', score: 78 },
    { skill: 'Pronunciation', score: 82 },
    { skill: 'Vocabulary', score: 90 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Không tìm thấy học viên.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar & Info */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl text-4xl font-bold">
                {student.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
                <div className="flex flex-wrap gap-3 text-purple-100">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {student.class}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ml-auto flex gap-2">
              <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{student.xp}</div>
                  <div className="text-sm text-purple-50">Total XP</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold">{student.streak}</div>
                  <div className="text-sm text-purple-50">Day Streak</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{student.accuracy}%</div>
                  <div className="text-sm text-purple-50">Accuracy</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">Level {student.level}</div>
                  <div className="text-sm text-purple-50">Current Level</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Overall Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Course Completion</span>
                    <span className="text-sm font-semibold">{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-3" />
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Weekly XP Progress
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
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

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Accuracy Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {recentActivities.map((activity, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${
                    activity.type === 'lesson'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {activity.type === 'lesson' ? (
                      <BookOpen className={`h-6 w-6 ${
                        activity.type === 'lesson'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-green-600 dark:text-green-400'
                      }`} />
                    ) : (
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      <Badge
                        className={
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  {activity.status === 'completed' && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {activity.score}%
                      </div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Skills Assessment
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {skillsData.map((skill) => (
                <Card key={skill.skill} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {skill.skill}
                    </h4>
                    <Badge className="text-lg px-3 py-1">
                      {skill.score}%
                    </Badge>
                  </div>
                  <Progress value={skill.score} className="h-3" />
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {skill.score >= 85 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">
                          Excellent progress
                        </span>
                      </>
                    ) : skill.score >= 70 ? (
                      <>
                        <Target className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Good progress
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">
                          Needs improvement
                        </span>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
