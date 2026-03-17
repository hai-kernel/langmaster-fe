import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface SessionItem {
  id: number | string;
  title: string;
  level?: string;
  lessons: number;
  duration?: number;
  order?: number;
  description?: string;
  objectives?: string[];
  topics?: string[];
}

interface CurriculumPath {
  id: string;
  name: string;
  level: string;
  sessions: SessionItem[];
  totalLessons: number;
  totalDuration: number;
  studentsEnrolled: number;
}

export function Curriculum() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [curriculumPaths, setCurriculumPaths] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.curriculum.getAll(),
      apiService.session.getAll(),
      apiService.lesson.getAll(),
    ])
      .then(([curRes, sessRes, lessonRes]) => {
        const curricula = (curRes.data?.data ?? []) as any[];
        const sessions = (sessRes.data?.data ?? []) as any[];
        const lessons = (lessonRes.data?.data ?? []) as any[];
        const paths: CurriculumPath[] = curricula.map((c: any) => {
          const courseSessions = (sessions as any[]).filter((s: any) => s.courseId === c.id);
          const sessionIds = courseSessions.map((s: any) => s.id);
          const courseLessons = (lessons as any[]).filter((l: any) => l.sessionId && sessionIds.includes(l.sessionId));
          const sessionItems: SessionItem[] = courseSessions.map((s: any) => {
            const count = courseLessons.filter((l: any) => l.sessionId === s.id).length;
            return {
              id: s.id,
              title: s.title || '',
              level: s.level,
              lessons: count,
              duration: 0,
              order: s.orderIndex ?? 0,
              description: s.description,
              objectives: [],
              topics: [],
            };
          });
          return {
            id: String(c.id),
            name: c.title || c.name || `Khóa ${c.id}`,
            level: c.level || 'All',
            sessions: sessionItems,
            totalLessons: courseLessons.length,
            totalDuration: 0,
            studentsEnrolled: 0,
          };
        });
        setCurriculumPaths(paths);
      })
      .catch(() => {
        toast.error('Không tải được lộ trình');
        setCurriculumPaths([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPaths = curriculumPaths.filter((path) => {
    const matchesLevel =
      selectedLevel === 'all' || path.level.toLowerCase().includes(selectedLevel.toLowerCase());
    const matchesSearch =
      path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.sessions.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleCreateCurriculum = () => {
    navigate('/admin/curriculum');
  };

  const handleEditPath = (pathId: string) => {
    toast.info('Edit Curriculum Path - Coming soon!');
  };

  const handleDeletePath = (pathId: string) => {
    toast.error('Delete Curriculum Path - Coming soon!');
  };

  const handleAddSession = (pathId: string) => {
    toast.info('Add Session to path - Coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Curriculum Management</h1>
                <p className="text-indigo-50">Plan and organize your teaching program</p>
              </div>
            </div>
            <Button
              onClick={handleCreateCurriculum}
              className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Create Curriculum Path</span>
              <span className="md:hidden">Create</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-indigo-200" />
                <div>
                  <div className="text-2xl font-bold">
                    {curriculumPaths.reduce((sum, p) => sum + p.sessions.length, 0)}
                  </div>
                  <div className="text-sm text-indigo-50">Total Sessions</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-300" />
                <div>
                  <div className="text-2xl font-bold">
                    {curriculumPaths.reduce((sum, p) => sum + p.totalLessons, 0)}
                  </div>
                  <div className="text-sm text-indigo-50">Total Lessons</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-300" />
                <div>
                  <div className="text-2xl font-bold">
                    {curriculumPaths.reduce((sum, p) => sum + p.totalDuration, 0)}h
                  </div>
                  <div className="text-sm text-indigo-50">Total Duration</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-300" />
                <div>
                  <div className="text-2xl font-bold">
                    {curriculumPaths.reduce((sum, p) => sum + p.studentsEnrolled, 0)}
                  </div>
                  <div className="text-sm text-indigo-50">Students Enrolled</div>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search curriculum paths or sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner (A1-A2)</SelectItem>
                <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Curriculum Paths */}
        <div className="space-y-6">
          {filteredPaths.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                  <GraduationCap className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No curriculum paths found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or create a new curriculum path.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            filteredPaths.map((path) => (
              <Card key={path.id} className="overflow-hidden">
                {/* Path Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {path.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {path.level}
                        </Badge>
                        <Badge variant="outline">{path.sessions.length} Sessions</Badge>
                        <Badge variant="outline">{path.totalLessons} Lessons</Badge>
                        <Badge variant="outline">{path.totalDuration} hours</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {path.studentsEnrolled} students enrolled
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEditPath(path.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeletePath(path.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Sessions ({path.sessions.length})</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSession(path.id)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Session
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {path.sessions.map((session) => {
                      const isExpanded = expandedSession === session.id;
                      return (
                        <Card
                          key={session.id}
                          className="border-l-4 border-l-indigo-500 hover:shadow-md transition-all"
                        >
                          {/* Session Header */}
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => toggleSession(session.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    Session {session.order}
                                  </Badge>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {session.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {session.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {session.lessons} lessons
                                  </Badge>
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.duration}h
                                  </Badge>
                                  <Badge variant="outline">{session.level}</Badge>
                                </div>
                              </div>
                              <Button size="icon" variant="ghost">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Session Details (Expanded) */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t pt-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-semibold mb-2 text-sm">
                                    Learning Objectives:
                                  </h5>
                                  <ul className="space-y-1">
                                    {session.objectives.map((obj, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                                      >
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        {obj}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-semibold mb-2 text-sm">Topics Covered:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {session.topics.map((topic, idx) => (
                                      <Badge key={idx} variant="secondary">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Session
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Calendar className="h-4 w-4" />
                                  View Lessons
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
