import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  BookOpen, Search, Video, Mic, MessageSquare, FileText, Users, Loader2,
  Brain, TrendingUp, AlertTriangle, Eye,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface PronunciationAttempt {
  id: number;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  lessonId?: number;
  lessonTitle?: string;
  sessionTitle?: string;
  expectedText: string;
  recognizedText: string;
  pronunciationScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  prosodyScore?: number;
  completenessScore?: number;
  status: string;
  createdAt: string;
  errorMessage?: string;
  feedback?: Record<string, unknown>;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ContentTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [lessons, setLessons] = useState<Array<{ id: number; title: string; type?: string; sessionId?: number; durationMinutes?: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.lesson.getAll()
      .then(res => {
        const list = (res.data?.data ?? []) as Array<{ id: number; title: string; type?: string; sessionId?: number; durationMinutes?: number }>;
        setLessons(list);
      })
      .catch(() => toast.error('Không tải được danh sách bài học'))
      .finally(() => setLoading(false));
  }, []);

  const typeColors: Record<string, string> = {
    VIDEO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    SPEAKING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    QUIZ: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    VOCAB: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };
  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = { VIDEO: Video, SPEAKING: Mic, QUIZ: MessageSquare, VOCAB: FileText };

  const filtered = lessons.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || l.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Tìm bài học..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Loại bài học" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="SPEAKING">Phát âm</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="VOCAB">Từ vựng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Chưa có bài học nào.</p>
          <p className="text-sm mt-1">Dữ liệu từ hệ thống — tạo bài học qua Topic / Session.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((lesson) => {
            const TypeIcon = (lesson.type && typeIcons[lesson.type]) ? typeIcons[lesson.type] : FileText;
            const typeColor = (lesson.type && typeColors[lesson.type]) ? typeColors[lesson.type] : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            return (
              <Card key={lesson.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-2xl">
                      <TypeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={typeColor}>{lesson.type ?? 'N/A'}</Badge>
                        <Badge variant="outline">Lesson #{lesson.id}</Badge>
                        {lesson.sessionId != null && <Badge variant="outline">Session {lesson.sessionId}</Badge>}
                        {lesson.durationMinutes != null && <span className="text-sm text-gray-500">{lesson.durationMinutes} phút</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PronunciationReviewTab() {
  const [attempts, setAttempts] = useState<PronunciationAttempt[]>([]);
  const [userSummaries, setUserSummaries] = useState<Array<{ userId: string; userEmail: string; userFullName: string; attemptCount: number; avgPronunciationScore: number | null; lastAttemptAt: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const loadRecords = (p: number) => {
    setLoading(true);
    apiService.admin.content.getPronunciationRecords({ page: p, size })
      .then(res => {
        const data = res.data?.data as { content?: PronunciationAttempt[]; totalPages?: number; totalElements?: number } | undefined;
        if (data && data.content) {
          setAttempts(data.content);
          setTotalPages(data.totalPages ?? 0);
          setTotalElements(data.totalElements ?? 0);
        }
      })
      .catch(() => toast.error('Không tải được bản ghi phát âm'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiService.admin.content.getPronunciationUserSummaries()
      .then(res => {
        const list = (res.data?.data ?? []) as Array<{ userId: string; userEmail: string; userFullName: string; attemptCount: number; avgPronunciationScore: number | null; lastAttemptAt: string | null }>;
        setUserSummaries(list);
      })
      .catch(() => {});
    loadRecords(0);
  }, []);

  useEffect(() => { if (page > 0) loadRecords(page); }, [page]);

  const scoreColor = (score: number) => score >= 85 ? 'text-green-600' : score >= 65 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = (score: number) => score >= 85 ? 'bg-green-50' : score >= 65 ? 'bg-yellow-50' : 'bg-red-50';
  const avgScore = attempts.filter(a => (a.pronunciationScore ?? 0) > 0).length
    ? Math.round(attempts.filter(a => (a.pronunciationScore ?? 0) > 0).reduce((acc, a) => acc + (a.pronunciationScore ?? 0), 0) / attempts.filter(a => (a.pronunciationScore ?? 0) > 0).length)
    : 0;

  if (loading && attempts.length === 0) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-4">
      {userSummaries.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Người dùng có bản ghi âm</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Người dùng</th><th className="text-left py-2">Email</th><th className="text-right py-2">Số lượt</th><th className="text-right py-2">Điểm TB</th><th className="text-right py-2">Lần cuối</th></tr></thead>
              <tbody>
                {userSummaries.slice(0, 10).map(u => (
                  <tr key={u.userId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">{u.userFullName || u.userId}</td>
                    <td className="py-2 text-gray-500">{u.userEmail}</td>
                    <td className="py-2 text-right">{u.attemptCount}</td>
                    <td className="py-2 text-right">{u.avgPronunciationScore != null ? Math.round(u.avgPronunciationScore) + '%' : '-'}</td>
                    <td className="py-2 text-right text-gray-500">{u.lastAttemptAt ? new Date(u.lastAttemptAt).toLocaleString('vi-VN') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Tổng lượt chấm', value: totalElements, icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Điểm trung bình (trang)', value: avgScore + '%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Thất bại (trang)', value: attempts.filter(a => a.status === 'FAILED').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2 rounded-xl`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
              <div><div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div><div className="text-sm text-gray-500">{stat.label}</div></div>
            </div>
          </Card>
        ))}
      </div>

      {attempts.length === 0 && !loading && (
        <Card className="p-8 text-center text-gray-500">
          <Mic className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Chưa có bản ghi phát âm nào.
        </Card>
      )}
      {attempts.map(attempt => (
        <Card key={attempt.id} className={`p-5 ${scoreBg(attempt.pronunciationScore ?? 0)}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{attempt.userFullName || attempt.userEmail || attempt.userId}</div>
              <div className="text-xs text-gray-500">{attempt.lessonTitle && `Bài: ${attempt.lessonTitle}`} {attempt.sessionTitle && ` · ${attempt.sessionTitle}`}</div>
              <div className="text-xs text-gray-500 mt-0.5">{new Date(attempt.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            <Badge className={attempt.status === 'SCORED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
              {attempt.status}
            </Badge>
          </div>
          <div className="space-y-1 mb-3">
            <div className="text-sm"><span className="font-medium text-gray-600 dark:text-gray-400">Câu gốc: </span><span className="text-gray-800 dark:text-gray-200">"{attempt.expectedText || '-'}"</span></div>
            {(attempt.recognizedText != null && attempt.recognizedText !== '') && <div className="text-sm"><span className="font-medium text-gray-600 dark:text-gray-400">Nhận diện: </span><span className="text-gray-800 dark:text-gray-200">"{attempt.recognizedText}"</span></div>}
            {attempt.errorMessage && <div className="text-sm text-red-600 dark:text-red-400">{attempt.errorMessage}</div>}
          </div>
          {(attempt.pronunciationScore ?? 0) > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Phát âm', value: attempt.pronunciationScore ?? 0 },
                { label: 'Chính xác', value: attempt.accuracyScore ?? 0 },
                { label: 'Lưu loát', value: attempt.fluencyScore ?? 0 },
                { label: 'Ngữ điệu', value: attempt.prosodyScore ?? 0 },
                { label: 'Hoàn chỉnh', value: attempt.completenessScore ?? 0 },
              ].filter(s => s.value > 0).map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold ${scoreColor(s.value)}`}>{Math.round(s.value)}%</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Trước</Button>
          <span className="flex items-center px-3 text-sm text-gray-500">Trang {page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Sau</Button>
        </div>
      )}
    </div>
  );
}

interface VideoLessonRow {
  lessonId: number;
  lessonTitle: string;
  lessonType: string;
  sessionTitle: string;
  topicName: string;
  videoUrl: string;
  youtubeUrl: string;
  transcriptSegmentCount: number;
  hasTranscript: boolean;
}

interface LessonDetailForVideo {
  id: number;
  title: string;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  transcriptJson?: Array<{ text?: string; viText?: string; ipa?: string; start?: number; end?: number }> | null;
}

function VideoReviewTab() {
  const [videos, setVideos] = useState<VideoLessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLessonId, setDetailLessonId] = useState<number | null>(null);
  const [detailLesson, setDetailLesson] = useState<LessonDetailForVideo | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    apiService.admin.content.getVideoLessonsDetail()
      .then(res => {
        const list = (res.data?.data ?? []) as VideoLessonRow[];
        setVideos(list);
      })
      .catch(() => toast.error('Không tải được danh sách video lesson'))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (v: VideoLessonRow) => {
    setDetailLessonId(v.lessonId);
    setDetailLesson(null);
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!detailOpen || detailLessonId == null) return;
    setDetailLoading(true);
    apiService.lesson.getById(detailLessonId)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        if (raw && typeof raw === 'object') {
          setDetailLesson({
            id: raw.id ?? detailLessonId,
            title: raw.title ?? '',
            videoUrl: raw.videoUrl,
            youtubeUrl: raw.youtubeUrl,
            transcriptJson: Array.isArray(raw.transcriptJson) ? raw.transcriptJson : null,
          });
        }
      })
      .catch(() => {
        toast.error('Không tải được chi tiết bài học');
        setDetailLesson(null);
      })
      .finally(() => setDetailLoading(false));
  }, [detailOpen, detailLessonId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Chưa có bài học nào có video.</p>
        <p className="text-gray-400 text-sm mt-1">Các lesson có video (đã lưu transcript) sẽ hiển thị tại đây.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-2 w-[40%]">Bài học</th>
              <th className="py-2 pr-2">Session / Topic</th>
              <th className="py-2 pr-2">Transcript</th>
              <th className="py-2 pr-2">Video / YouTube</th>
              <th className="py-2 pr-2 w-[130px] shrink-0">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.lessonId} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 pr-2">
                  <div className="font-medium text-gray-900 dark:text-white">{v.lessonTitle}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">#{v.lessonId}</Badge>
                    {v.lessonType && <Badge className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-400">{v.lessonType}</Badge>}
                    <Button variant="outline" size="sm" className="gap-1 h-7 text-xs shrink-0" onClick={() => openDetail(v)}>
                      <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                    </Button>
                  </div>
                </td>
                <td className="py-3 pr-2 text-gray-600 dark:text-gray-400">
                  <div>{v.sessionTitle ?? '-'}</div>
                  <div className="text-xs text-gray-500">{v.topicName ?? '-'}</div>
                </td>
                <td className="py-3 pr-2">
                  {v.hasTranscript ? <span className="text-green-600">{v.transcriptSegmentCount} đoạn</span> : <span className="text-gray-400">Chưa có</span>}
                </td>
                <td className="py-3 pr-2">
                  <div className="flex flex-col gap-1">
                    {v.videoUrl && <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Video</a>}
                    {v.youtubeUrl && <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-xs">YouTube</a>}
                    {!v.videoUrl && !v.youtubeUrl && <span className="text-gray-400 text-xs">-</span>}
                  </div>
                </td>
                <td className="py-3 pr-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto" onClick={() => openDetail(v)}>
                    <Eye className="h-4 w-4" /> Xem chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {detailLesson ? detailLesson.title : 'Chi tiết nội dung video'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              </div>
            ) : detailLesson ? (
              <>
                <div className="rounded-lg overflow-hidden bg-black/5 dark:bg-black/20 aspect-video max-h-[340px]">
                  {getYoutubeEmbedUrl(detailLesson.youtubeUrl) ? (
                    <iframe
                      title="Video"
                      src={getYoutubeEmbedUrl(detailLesson.youtubeUrl)!}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : detailLesson.videoUrl ? (
                    <video
                      src={detailLesson.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Video className="h-12 w-12 opacity-50" />
                      <span className="ml-2">Chưa có video</span>
                    </div>
                  )}
                </div>
                {detailLesson.transcriptJson && detailLesson.transcriptJson.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transcript ({detailLesson.transcriptJson.length} câu)</h4>
                    <ScrollArea className="h-[240px] rounded-md border border-gray-200 dark:border-gray-700 p-3">
                      <div className="space-y-3 pr-4">
                        {detailLesson.transcriptJson.map((seg: any, idx: number) => (
                          <div key={idx} className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                            <p className="font-medium text-gray-900 dark:text-white">{seg.text ?? '-'}</p>
                            {seg.viText && <p className="text-gray-600 dark:text-gray-400 mt-0.5">{seg.viText}</p>}
                            {seg.ipa && <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 font-mono">/{seg.ipa}/</p>}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có transcript.</p>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AIAnalysisTab() {
  return (
    <div className="space-y-4">
      <Card className="p-12 text-center">
        <Brain className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Phân tích hội thoại AI</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 max-w-md mx-auto">
          Báo cáo hội thoại AI (số cuộc hội thoại, tin nhắn theo người dùng) sẽ hiển thị tại đây khi backend có API tương ứng.
        </p>
        <p className="text-xs text-gray-400 mt-4">Hiện chưa có dữ liệu mock — toàn bộ dữ liệu dùng từ hệ thống.</p>
      </Card>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ContentManagement() {
  const [report, setReport] = useState<{
    totalLessons: number;
    lessonsWithVideo: number;
    lessonsWithoutVideo: number;
    totalPronunciationAttempts: number;
    totalUsersWithAttempts: number;
  } | null>(null);
  const [reportLoading, setReportLoading] = useState(true);

  useEffect(() => {
    apiService.admin.content.getReport()
      .then(res => {
        const data = res.data?.data;
        if (data) setReport(data);
      })
      .catch(() => toast.error('Không tải được báo cáo'))
      .finally(() => setReportLoading(false));
  }, []);

  const totalLessons = report?.totalLessons ?? 0;
  const lessonsWithVideo = report?.lessonsWithVideo ?? 0;
  const lessonsWithoutVideo = report?.lessonsWithoutVideo ?? 0;
  const totalPronunciationAttempts = report?.totalPronunciationAttempts ?? 0;
  const totalUsersWithAttempts = report?.totalUsersWithAttempts ?? 0;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nội dung & Bài học</h1>
              <p className="text-slate-200 text-sm">Quản lý bài học, video, chấm phát âm và phân tích AI (dữ liệu từ hệ thống)</p>
            </div>
          </div>

          {reportLoading ? (
            <div className="flex items-center justify-center py-8 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Đang tải báo cáo...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Tổng bài học', value: totalLessons, icon: BookOpen },
                { label: 'Có video', value: lessonsWithVideo, icon: Video },
                { label: 'Chưa có video', value: lessonsWithoutVideo, icon: FileText },
                { label: 'Bản ghi phát âm', value: totalPronunciationAttempts, icon: Mic },
                { label: 'Người dùng có thu âm', value: totalUsersWithAttempts, icon: Users },
              ].map(stat => (
                <Card key={stat.label} className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                  <div className="flex items-center gap-3">
                    <stat.icon className="h-8 w-8 text-white" />
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-indigo-100">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="content">
          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-white dark:bg-gray-900 p-1 rounded-2xl shadow-sm">
            <TabsTrigger value="content" className="gap-2 rounded-xl">
              <FileText className="h-4 w-4" />Content
            </TabsTrigger>
            <TabsTrigger value="pronunciation" className="gap-2 rounded-xl">
              <Mic className="h-4 w-4" />Chấm phát âm
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2 rounded-xl">
              <Video className="h-4 w-4" />Duyệt Video
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 rounded-xl">
              <Brain className="h-4 w-4" />Phân tích AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          <TabsContent value="pronunciation">
            <PronunciationReviewTab />
          </TabsContent>

          <TabsContent value="video">
            <VideoReviewTab />
          </TabsContent>

          <TabsContent value="ai">
            <AIAnalysisTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
