import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  BookOpen,
  Search,
  Video,
  Mic,
  MessageSquare,
  FileText,
  Plus,
  Play,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Star,
  Users,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { CreateLessonModal } from './CreateLessonModal';
import { AssignContentModal } from './AssignContentModal';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

interface Content {
  id: string;
  title: string;
  type: 'video' | 'pronunciation' | 'conversation' | 'vocabulary';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  rating: number;
  uses: number;
  createdAt: string;
  status: 'published' | 'draft';
  thumbnail?: string;
}

function mapLessonTypeToContentType(backendType: string): Content['type'] {
  const t = (backendType || '').toUpperCase();
  if (t === 'VIDEO') return 'video';
  if (t === 'SPEAKING') return 'pronunciation';
  if (t === 'VOCAB') return 'vocabulary';
  if (t === 'QUIZ') return 'conversation';
  return 'video';
}

export function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | Content['type']>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | Content['level']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = () => {
    setLoading(true);
    apiService.lesson
      .getAll()
      .then((res) => {
        const list = (res.data?.data ?? []) as any[];
        const arr = Array.isArray(list) ? list : [];
        setContents(
          arr.map((l: any) => ({
            id: String(l.id),
            title: l.title || `Bài học ${l.id}`,
            type: mapLessonTypeToContentType(l.type),
            level: (l.level as Content['level']) || 'beginner',
            duration: l.durationMinutes ?? 0,
            rating: 0,
            uses: 0,
            createdAt: l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : '',
            status: 'published',
            thumbnail: l.thumbnailUrl,
          }))
        );
      })
      .catch(() => {
        toast.error('Không tải được danh sách bài học');
        setContents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const types = [
    { id: 'all' as const, label: 'All', icon: BookOpen },
    { id: 'video' as const, label: 'Video', icon: Video },
    { id: 'pronunciation' as const, label: 'Pronunciation', icon: Mic },
    { id: 'conversation' as const, label: 'Conversation', icon: MessageSquare },
    { id: 'vocabulary' as const, label: 'Vocabulary', icon: FileText },
  ];

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const typeColors = {
    video: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pronunciation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    conversation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    vocabulary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'video':
        return Video;
      case 'pronunciation':
        return Mic;
      case 'conversation':
        return MessageSquare;
      case 'vocabulary':
        return FileText;
    }
  };

  const filteredContents = contents.filter((content) => {
    const matchesSearch = content.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || content.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || content.level === selectedLevel;
    return matchesSearch && matchesType && matchesLevel;
  });

  const stats = {
    total: contents.length,
    published: contents.filter((c) => c.status === 'published').length,
    avgRating:
      contents.filter((c) => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) /
      (contents.filter((c) => c.rating > 0).length || 1),
    totalUses: contents.reduce((sum, c) => sum + c.uses, 0),
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
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Content Library</h1>
                <p className="text-indigo-50">Manage your teaching resources</p>
              </div>
            </div>
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5" />
              Create Content
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-indigo-50">Total Content</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                  <div className="text-sm text-indigo-50">Avg Rating</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUses}</div>
                  <div className="text-sm text-indigo-50">Total Uses</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.published}</div>
                  <div className="text-sm text-indigo-50">Published</div>
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
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className={`gap-2 ${
                    selectedType === type.id ? 'bg-indigo-500 hover:bg-indigo-600' : ''
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {levels.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level as any)}
                  className={`capitalize ${
                    selectedLevel === level ? 'bg-indigo-500 hover:bg-indigo-600' : ''
                  }`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => {
            const TypeIcon = getTypeIcon(content.type);
            return (
              <Card
                key={content.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 h-40 flex items-center justify-center">
                  <TypeIcon className="h-16 w-16 text-indigo-500 dark:text-indigo-400" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                      {content.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Play className="h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={typeColors[content.type]}>
                      {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                    </Badge>
                    <Badge className={levelColors[content.level]}>
                      {content.level.charAt(0).toUpperCase() + content.level.slice(1)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        content.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }
                    >
                      {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{content.rating > 0 ? content.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{content.uses} uses</span>
                    </div>
                    <span>{content.duration} min</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button className="w-full bg-indigo-500 hover:bg-indigo-600 gap-2">
                      <Play className="h-4 w-4" />
                      Use in Lesson
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredContents.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No content found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or create new content
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreateLessonModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchLessons}
      />
      <AssignContentModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        contentType="lesson"
        contentId={selectedContent || undefined}
      />
    </div>
  );
}