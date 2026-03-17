import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  Eye,
  Mail,
  MessageSquare,
  Star,
  Award,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  class: string;
  progress: number;
  streak: number;
  accuracy: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'at-risk';
  trend: 'up' | 'down' | 'stable';
}

export function StudentsManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const students: Student[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      level: 8,
      xp: 2450,
      class: 'Class 10A',
      progress: 75,
      streak: 12,
      accuracy: 87,
      lastActive: '2026-01-16',
      status: 'active',
      trend: 'up',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      level: 6,
      xp: 1820,
      class: 'Class 10A',
      progress: 62,
      streak: 5,
      accuracy: 92,
      lastActive: '2026-01-15',
      status: 'active',
      trend: 'up',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      level: 4,
      xp: 980,
      class: 'Class 10B',
      progress: 35,
      streak: 0,
      accuracy: 68,
      lastActive: '2026-01-10',
      status: 'at-risk',
      trend: 'down',
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      email: 'phamthid@email.com',
      level: 10,
      xp: 3200,
      class: 'Class 10A',
      progress: 88,
      streak: 25,
      accuracy: 95,
      lastActive: '2026-01-16',
      status: 'active',
      trend: 'up',
    },
    {
      id: '5',
      name: 'Hoàng Văn E',
      email: 'hoangvane@email.com',
      level: 5,
      xp: 1450,
      class: 'Class 10B',
      progress: 48,
      streak: 2,
      accuracy: 75,
      lastActive: '2026-01-14',
      status: 'inactive',
      trend: 'stable',
    },
  ];

  const classes = ['all', 'Class 10A', 'Class 10B', 'Class 11A'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    atRisk: students.filter((s) => s.status === 'at-risk').length,
    avgProgress: Math.round(
      students.reduce((sum, s) => sum + s.progress, 0) / students.length
    ),
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'at-risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getTrendIcon = (trend: Student['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Students Management</h1>
                <p className="text-purple-50">Monitor and support your students</p>
              </div>
            </div>
            <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2">
              <UserPlus className="h-5 w-5" />
              Add Student
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-purple-50">Total Students</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-sm text-purple-50">Active</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.atRisk}</div>
                  <div className="text-sm text-purple-50">At Risk</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                  <div className="text-sm text-purple-50">Avg Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {classes.map((className) => (
                <Button
                  key={className}
                  variant={selectedClass === className ? 'default' : 'outline'}
                  onClick={() => setSelectedClass(className)}
                  className={
                    selectedClass === className ? 'bg-purple-500 hover:bg-purple-600' : ''
                  }
                >
                  {className === 'all' ? 'All Classes' : className}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar & Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      {getTrendIcon(student.trend)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {student.email}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[student.status]}>
                        {student.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline">{student.class}</Badge>
                      <Badge variant="outline">Level {student.level}</Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Progress
                    </div>
                    <Progress value={student.progress} className="mb-1" />
                    <div className="text-sm font-semibold">{student.progress}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">XP</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {student.xp}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Streak</div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {student.streak} days
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Accuracy
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {student.accuracy}%
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Mail className="h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Award className="h-4 w-4" />
                        Award Badge
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Last active: {new Date(student.lastActive).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No students found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}