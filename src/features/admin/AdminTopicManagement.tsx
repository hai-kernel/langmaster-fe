import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { AdminPageLayout } from '@/app/components/layout/AdminPageLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Video,
  Mic,
  Brain,
  MessageCircle,
  Users,
  Loader2,
} from 'lucide-react';

interface LessonInfo {
  id: number;
  title: string;
  description: string;
  type: string;
  orderIndex: number;
  durationMinutes: number;
  sessionId: number;
}

interface TopicSession {
  id: number;
  title: string;
  orderIndex: number;
  lessonCount: number;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  difficultyLevel: string;
  orderIndex: number;
  estimatedDurationMinutes: number;
  thumbnailUrl?: string;
  isActive: boolean;
  sessionCount: number;
  sessions: TopicSession[];
}

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

const LESSON_TYPE_OPTIONS = [
  { value: 'VOCAB', label: 'Từ vựng', icon: Brain, color: 'text-orange-500' },
  { value: 'SPEAKING', label: 'Phát âm', icon: Mic, color: 'text-green-500' },
  { value: 'QUIZ', label: 'Hội thoại AI', icon: MessageCircle, color: 'text-purple-500' },
  { value: 'VIDEO', label: 'Video', icon: Video, color: 'text-blue-500' },
];

export default function AdminTopicManagement() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [sessionLessons, setSessionLessons] = useState<Record<number, LessonInfo[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<Set<number>>(new Set());

  // Dialog state
  const [topicDialog, setTopicDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editSessionDialog, setEditSessionDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSessionForLesson, setSelectedSessionForLesson] = useState<TopicSession | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonInfo | null>(null);
  const [editingSession, setEditingSession] = useState<TopicSession | null>(null);

  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsTopic, setParticipantsTopic] = useState<Topic | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  // Form state - Topic
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    difficultyLevel: 'BEGINNER',
    orderIndex: 1,
    estimatedDurationMinutes: 30,
    thumbnailUrl: '',
  });

  // Form state - Session
  const [sessionForm, setSessionForm] = useState({
    title: '',
    orderIndex: 1,
  });

  // Form state - Lesson
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'VOCAB',
    durationMinutes: 5,
    orderIndex: 1,
  });

  // Video fields (only for VIDEO type lessons)
  const [videoUrl, setVideoUrl] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [scriptView, setScriptView] = useState<'preview' | 'json'>('preview');
  const [savingVideo, setSavingVideo] = useState(false);

  // YouTube analyze flow
  const [youtubeInputUrl, setYoutubeInputUrl] = useState('');
  const [analyzeStatus, setAnalyzeStatus] = useState<'idle' | 'submitting' | 'processing' | 'done' | 'error'>('idle');
  const [analyzeMessage, setAnalyzeMessage] = useState('');
  const [pollingRef, setPollingRef] = useState<ReturnType<typeof setInterval> | null>(null);

  // Upload file flow
  const [videoTab, setVideoTab] = useState<'youtube' | 'upload'>('youtube');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const res = await apiService.topic.getAll();
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setTopics(list);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối backend';
      toast.error('Không tải được danh sách chủ đề', { description: msg });
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const openTopicParticipants = async (topic: Topic) => {
    setParticipantsTopic(topic);
    setParticipantsModalOpen(true);
    setParticipantsLoading(true);
    try {
      const res = await apiService.topic.getParticipants(topic.id);
      setParticipants(res.data?.data ?? []);
    } catch {
      toast.error('Không tải được danh sách người tham gia chủ đề');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleRemoveTopicParticipant = async (user: any) => {
    if (!participantsTopic) return;
    if (!window.confirm(`Xóa ${user.fullName || user.email} khỏi chủ đề "${participantsTopic.name}"? Tiến trình học trong chủ đề này sẽ bị reset.`)) return;
    try {
      await apiService.topic.removeParticipant(participantsTopic.id, user.email);
      toast.success('Đã xóa người dùng khỏi chủ đề');
      setParticipants(prev => prev.filter((x: any) => x.email !== user.email));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Không thể xóa người dùng khỏi chủ đề';
      toast.error(msg);
    }
  };

  const toggleSession = async (sessionId: number) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) { next.delete(sessionId); return next; }
      next.add(sessionId);
      return next;
    });
    if (!sessionLessons[sessionId]) {
      setLoadingLessons((prev) => new Set(prev).add(sessionId));
      try {
        const res = await apiService.lesson.getBySession(sessionId);
        const list = res.data?.data ?? res.data ?? [];
        setSessionLessons((prev) => ({ ...prev, [sessionId]: Array.isArray(list) ? list : [] }));
      } catch { setSessionLessons((prev) => ({ ...prev, [sessionId]: [] })); }
      finally { setLoadingLessons((prev) => { const s = new Set(prev); s.delete(sessionId); return s; }); }
    }
  };

  const openAddLesson = (session: TopicSession) => {
    setEditingLesson(null);
    setSelectedSessionForLesson(session);
    setLessonForm({ title: '', description: '', type: 'VOCAB', durationMinutes: 5, orderIndex: (sessionLessons[session.id]?.length ?? 0) + 1 });
    setLessonDialog(true);
  };

  const openEditLesson = (lesson: LessonInfo) => {
    setEditingLesson(lesson);
    setSelectedSessionForLesson(null);
    setLessonForm({
      title: lesson.title,
      description: lesson.description ?? '',
      type: lesson.type ?? 'VOCAB',
      durationMinutes: lesson.durationMinutes ?? 5,
      orderIndex: lesson.orderIndex ?? 1,
    });
    // Reset video fields, load from lesson if already set
    setVideoUrl((lesson as any).videoUrl ?? '');
    setYoutubeInputUrl((lesson as any).youtubeUrl ?? '');
    setAnalyzeStatus('idle');
    setAnalyzeMessage('');
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress(0);
    setUploadFile(null);
    setVideoTab('youtube');
    stopPolling();
    setScriptText('');
    if ((lesson as any).transcriptJson) {
      try { setScriptText(JSON.stringify((lesson as any).transcriptJson, null, 2)); } catch { setScriptText(''); }
    }
    setLessonDialog(true);
  };

  const saveVideoContent = async (lessonId: number) => {
    if (!videoUrl.trim() && !scriptText.trim()) return;
    setSavingVideo(true);
    try {
      let transcriptJson: any[] | undefined;
      if (scriptText.trim()) {
        try { transcriptJson = JSON.parse(scriptText); }
        catch { toast.error('Script JSON không hợp lệ.'); return; }
      }
      await apiService.lesson.saveVideo(lessonId, {
        videoUrl: videoUrl.trim() || undefined,
        transcriptJson,
      });
      toast.success('Đã lưu video và script');
    } catch (err: any) {
      toast.error('Lưu video thất bại', { description: err?.message });
    } finally {
      setSavingVideo(false);
    }
  };

  const reloadSessionLessons = async (sessionId: number) => {
    const res = await apiService.lesson.getBySession(sessionId);
    const list = res.data?.data ?? res.data ?? [];
    setSessionLessons((prev) => ({ ...prev, [sessionId]: Array.isArray(list) ? list : [] }));
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    try {
      setSaving(true);
      if (editingLesson) {
        await apiService.lesson.update(editingLesson.id, lessonForm);
        if (lessonForm.type === 'VIDEO') await saveVideoContent(editingLesson.id);
        toast.success('Đã cập nhật bài học');
        setLessonDialog(false);
        await reloadSessionLessons(editingLesson.sessionId);
      } else if (selectedSessionForLesson) {
        const res = await apiService.lesson.create({ ...lessonForm, sessionId: selectedSessionForLesson.id });
        const created = res.data?.data ?? res.data;
        if (lessonForm.type === 'VIDEO' && created?.id) await saveVideoContent(created.id);
        toast.success('Đã thêm bài học');
        setLessonDialog(false);
        await reloadSessionLessons(selectedSessionForLesson.id);
        loadTopics();
      }
    } catch (err: any) {
      toast.error('Không thể lưu bài học', { description: err?.response?.data?.message ?? err?.message });
    } finally { setSaving(false); }
  };

  const deleteLesson = async (lessonId: number, sessionId: number) => {
    if (!confirm('Xóa bài học này?')) return;
    try {
      await apiService.lesson.delete(lessonId);
      toast.success('Đã xóa bài học');
      setSessionLessons((prev) => ({ ...prev, [sessionId]: (prev[sessionId] ?? []).filter((l) => l.id !== lessonId) }));
      loadTopics();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể xóa bài học';
      toast.error(msg);
    }
  };

  const stopPolling = () => {
    setPollingRef((prev) => { if (prev) clearInterval(prev); return null; });
  };

  const analyzeYoutube = async (lessonId: number) => {
    if (!youtubeInputUrl.trim()) { toast.error('Nhập URL YouTube trước'); return; }
    try {
      setAnalyzeStatus('submitting');
      setAnalyzeMessage('Đang gửi yêu cầu phân tích...');
      await apiService.transcribe.youtube({ lessonId, youtubeUrl: youtubeInputUrl.trim() });
      setAnalyzeStatus('processing');
      setAnalyzeMessage('Đang xử lý... (có thể mất 1-3 phút)');
      toast.success('Đã gửi yêu cầu phân tích video YouTube');

      // Poll every 8s — backend trả { transcript: [...], s3Url }; cần lấy mảng transcript
      stopPolling();
      const id = setInterval(async () => {
        try {
          const res = await apiService.transcribe.getTranscript(lessonId);
          const data = res.data?.data ?? res.data;
          const transcript = Array.isArray(data) ? data : (data?.transcript ?? null);
          if (Array.isArray(transcript) && transcript.length > 0) {
            clearInterval(id);
            setPollingRef(null);
            setAnalyzeStatus('done');
            setAnalyzeMessage(`✅ Hoàn thành! ${transcript.length} câu đã được phân tích và dịch.`);
            toast.success(`Phân tích xong! ${transcript.length} câu`);
            // Refresh lesson data in dialog (có cả IPA từ backend)
            const lessonRes = await apiService.lesson.getById(lessonId);
            const l = lessonRes.data?.data ?? lessonRes.data;
            if (l?.transcriptJson) {
              try { setScriptText(JSON.stringify(l.transcriptJson, null, 2)); } catch { /* ignore */ }
            }
            if (l?.youtubeUrl) setYoutubeInputUrl(l.youtubeUrl);
          }
        } catch { /* keep polling */ }
      }, 8000);
      setPollingRef(id);
    } catch (err: any) {
      setAnalyzeStatus('error');
      setAnalyzeMessage('Lỗi: ' + (err?.response?.data?.message ?? err?.message ?? 'Không kết nối được'));
      toast.error('Gửi yêu cầu thất bại', { description: err?.message });
    }
  };

  const uploadAndTranscribe = async (lessonId: number) => {
    if (!uploadFile) { toast.error('Chọn file video trước'); return; }
    try {
      stopPolling();
      setUploadStatus('uploading');
      setUploadMessage('Đang upload lên server...');
      setUploadProgress(10);

      await apiService.transcribe.upload(lessonId, uploadFile, 'en-US');

      setUploadStatus('processing');
      setUploadProgress(50);
      setUploadMessage('Upload xong! Đang phân tích âm thanh, dịch tiếng Việt, tạo IPA...');
      toast.success('Upload thành công! Đang xử lý transcript...');

      // Poll every 8s — backend trả { transcript: [...], s3Url }; cần lấy mảng transcript
      const id = setInterval(async () => {
        try {
          const res = await apiService.transcribe.getTranscript(lessonId);
          const data = res.data?.data ?? res.data;
          const transcript = Array.isArray(data) ? data : (data?.transcript ?? null);
          if (Array.isArray(transcript) && transcript.length > 0) {
            clearInterval(id);
            setUploadStatus('done');
            setUploadProgress(100);
            setUploadMessage(`✅ Hoàn thành! ${transcript.length} câu đã được phân tích và dịch.`);
            toast.success(`Xử lý xong! ${transcript.length} câu`);
            const lessonRes = await apiService.lesson.getById(lessonId);
            const l = lessonRes.data?.data ?? lessonRes.data;
            if (l?.transcriptJson) {
              try { setScriptText(JSON.stringify(l.transcriptJson, null, 2)); } catch { /* ignore */ }
            }
          }
        } catch { /* keep polling */ }
      }, 8000);
      setPollingRef(id);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadProgress(0);
      setUploadMessage('Lỗi: ' + (err?.response?.data?.message ?? err?.message ?? 'Upload thất bại'));
      toast.error('Upload thất bại', { description: err?.message });
    }
  };

  const openEditSession = (session: TopicSession) => {
    setEditingSession(session);
    setSessionForm({ title: session.title, orderIndex: session.orderIndex ?? 1 });
    setEditSessionDialog(true);
  };

  const saveEditSession = async () => {
    if (!editingSession || !sessionForm.title.trim()) return;
    try {
      setSaving(true);
      await apiService.session.update(editingSession.id, sessionForm);
      toast.success('Đã cập nhật session');
      setEditSessionDialog(false);
      loadTopics();
    } catch (err: any) {
      toast.error('Không thể cập nhật session', { description: err?.message });
    } finally { setSaving(false); }
  };

  const deleteSession = async (sessionId: number) => {
    if (!confirm('Xóa session này? Tất cả bài học trong session sẽ bị xóa.')) return;
    try {
      await apiService.session.delete(sessionId);
      toast.success('Đã xóa session');
      setExpandedSessions((prev) => { const s = new Set(prev); s.delete(sessionId); return s; });
      setSessionLessons((prev) => { const n = { ...prev }; delete n[sessionId]; return n; });
      loadTopics();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể xóa session';
      toast.error(msg);
    }
  };

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicForm({ name: '', description: '', difficultyLevel: 'BEGINNER', orderIndex: topics.length + 1, estimatedDurationMinutes: 30, thumbnailUrl: '' });
    setTopicDialog(true);
  };

  const openEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name,
      description: topic.description ?? '',
      difficultyLevel: topic.difficultyLevel ?? 'BEGINNER',
      orderIndex: topic.orderIndex ?? 1,
      estimatedDurationMinutes: topic.estimatedDurationMinutes ?? 30,
      thumbnailUrl: topic.thumbnailUrl ?? '',
    });
    setTopicDialog(true);
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }
    try {
      setSaving(true);
      if (editingTopic) {
        await apiService.topic.update(editingTopic.id, topicForm);
        toast.success('Đã cập nhật chủ đề');
      } else {
        await apiService.topic.create(topicForm);
        toast.success('Đã tạo chủ đề mới');
      }
      setTopicDialog(false);
      loadTopics();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối backend';
      toast.error('Không thể lưu chủ đề', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const deleteTopic = async (id: number) => {
    if (!confirm('Xóa chủ đề này? Các session trong chủ đề sẽ bị xóa.')) return;
    try {
      await apiService.topic.delete(id);
      toast.success('Đã xóa chủ đề');
      loadTopics();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể xóa chủ đề';
      toast.error(msg);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await apiService.topic.toggle(id);
      loadTopics();
    } catch (err: any) {
      toast.error('Lỗi', { description: err?.message });
    }
  };

  const openAddSession = (topic: Topic) => {
    setSelectedTopic(topic);
    setSessionForm({ title: '', orderIndex: (topic.sessionCount ?? 0) + 1 });
    setSessionDialog(true);
  };

  const saveSession = async () => {
    if (!selectedTopic) return;
    if (!sessionForm.title.trim()) {
      toast.error('Vui lòng nhập tên session');
      return;
    }
    try {
      setSaving(true);
      await apiService.topic.addSession(selectedTopic.id, sessionForm);
      toast.success('Đã thêm session');
      setSessionDialog(false);
      loadTopics();
      setExpandedTopics((prev) => new Set(prev).add(selectedTopic.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối backend';
      toast.error('Không thể thêm session', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageLayout
      title="Chủ đề học (Topics)"
      subtitle="Tạo chủ đề và các buổi học (sessions) bên trong mỗi khóa học"
      icon={BookOpen}
      action={
        <Button onClick={openCreateTopic} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo chủ đề mới
        </Button>
      }
      stats={[
        { label: 'Tổng chủ đề', value: topics.length },
        { label: 'Đang hoạt động', value: topics.filter((t) => t.isActive).length },
        { label: 'Tổng session', value: topics.reduce((sum, t) => sum + (t.sessionCount ?? 0), 0) },
      ]}
    >
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm chủ đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* Topic List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Chưa có chủ đề nào. Tạo chủ đề đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Topic Row */}
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleExpand(topic.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {expandedTopics.has(topic.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {topic.orderIndex}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{topic.name}</span>
                    {topic.difficultyLevel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[topic.difficultyLevel] ?? 'bg-muted text-muted-foreground'}`}>
                        {DIFFICULTY_LABELS[topic.difficultyLevel] ?? topic.difficultyLevel}
                      </span>
                    )}
                    {!topic.isActive && (
                      <Badge variant="secondary" className="text-xs">Ẩn</Badge>
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{topic.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {topic.sessionCount} session
                    </span>
                    {topic.estimatedDurationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{topic.estimatedDurationMinutes} phút
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAddSession(topic)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Session
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openTopicParticipants(topic)}
                    className="text-xs gap-1"
                  >
                    <Users className="h-3 w-3" />
                    Người tham gia
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(topic.id)}
                    title={topic.isActive ? 'Ẩn chủ đề' : 'Hiện chủ đề'}
                  >
                    {topic.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditTopic(topic)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTopic(topic.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>

              {/* Sessions (expanded) */}
              {expandedTopics.has(topic.id) && (
                <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
                  {(topic.sessions ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2">
                      Chưa có session.{' '}
                      <button onClick={() => openAddSession(topic)} className="text-primary hover:underline">
                        Thêm session đầu tiên
                      </button>
                    </p>
                  ) : (
                    (topic.sessions ?? []).map((s, idx) => (
                      <div key={s.id} className="bg-card rounded-lg border border-border overflow-hidden">
                        {/* Session row */}
                        <div className="flex items-center gap-2 px-3 py-2">
                          <button onClick={() => toggleSession(s.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                            {expandedSessions.has(s.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.lessonCount} bài học</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => openAddLesson(s)} className="text-xs text-primary gap-1 h-7 flex-shrink-0">
                            <Plus className="h-3 w-3" /> Bài học
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => openEditSession(s)} title="Sửa session">
                            <Pencil className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => deleteSession(s.id)} title="Xóa session">
                            <Trash2 className="h-3 w-3 text-gray-300 hover:text-red-400" />
                          </Button>
                        </div>

                        {/* Lessons (expanded) */}
                        {expandedSessions.has(s.id) && (
                          <div className="border-t bg-gray-50 dark:bg-gray-900/30 px-3 py-2 space-y-1">
                            {loadingLessons.has(s.id) ? (
                              <p className="text-xs text-gray-400 py-1">Đang tải...</p>
                            ) : (sessionLessons[s.id] ?? []).length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-1">
                                Chưa có bài học.{' '}
                                <button onClick={() => openAddLesson(s)} className="text-blue-500 hover:underline">Thêm ngay</button>
                              </p>
                            ) : (
                              (sessionLessons[s.id] ?? []).map((lesson, li) => {
                                const typeOpt = LESSON_TYPE_OPTIONS.find((o) => o.value === lesson.type);
                                const Icon = typeOpt?.icon ?? Brain;
                                return (
                                  <div key={lesson.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border group">
                                    <div className={`flex-shrink-0 ${typeOpt?.color ?? 'text-gray-400'}`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{lesson.title}</p>
                                      <p className="text-xs text-gray-400">{typeOpt?.label ?? lesson.type} · {lesson.durationMinutes ?? 5} phút</p>
                                      {lesson.description && <p className="text-xs text-gray-400 truncate">{lesson.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => openEditLesson(lesson)} className="text-gray-400 hover:text-blue-500 p-0.5 rounded" title="Sửa bài học">
                                        <Pencil className="h-3 w-3" />
                                      </button>
                                      <button onClick={() => deleteLesson(lesson.id, s.id)} className="text-gray-400 hover:text-red-400 p-0.5 rounded" title="Xóa bài học">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Topic participants modal */}
      <Dialog open={participantsModalOpen} onOpenChange={setParticipantsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Người tham gia chủ đề
              {participantsTopic && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {participantsTopic.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {participantsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải danh sách người tham gia...</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              Chưa có học viên nào có tiến trình trong chủ đề này.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
              {participants.map((p: any) => {
                const percent = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0;
                const completed = p.topicCompleted || percent === 100;
                return (
                  <div
                    key={`${p.email}-${p.topicId}`}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {p.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">{p.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-muted-foreground">
                            {p.completedLessons}/{p.totalLessons} bài
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : percent > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {completed ? 'Hoàn thành' : percent > 0 ? 'Đang học' : 'Mới bắt đầu'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="mt-1 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTopicParticipant(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog open={topicDialog} onOpenChange={setTopicDialog}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingTopic ? 'Chỉnh sửa chủ đề' : 'Tạo chủ đề mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên chủ đề *</label>
              <Input
                value={topicForm.name}
                onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                placeholder="VD: Ăn uống, Du lịch, Công việc..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
              <textarea
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                placeholder="Mô tả ngắn về chủ đề..."
                className="mt-1 w-full border rounded-md p-2 text-sm resize-none h-20 bg-white dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cấp độ</label>
                <Select
                  value={topicForm.difficultyLevel}
                  onValueChange={(v) => setTopicForm({ ...topicForm, difficultyLevel: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thứ tự</label>
                <Input
                  type="number"
                  value={topicForm.orderIndex}
                  onChange={(e) => setTopicForm({ ...topicForm, orderIndex: Number(e.target.value) })}
                  className="mt-1"
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian ước tính (phút)</label>
              <Input
                type="number"
                value={topicForm.estimatedDurationMinutes}
                onChange={(e) => setTopicForm({ ...topicForm, estimatedDurationMinutes: Number(e.target.value) })}
                className="mt-1"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Thumbnail</label>
              <Input
                value={topicForm.thumbnailUrl}
                onChange={(e) => setTopicForm({ ...topicForm, thumbnailUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setTopicDialog(false)} disabled={saving}>Hủy</Button>
              <Button onClick={saveTopic} disabled={!topicForm.name.trim() || saving}>
                {saving ? 'Đang lưu...' : editingTopic ? 'Cập nhật' : 'Tạo chủ đề'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={editSessionDialog} onOpenChange={setEditSessionDialog}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa session</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên session *</label>
              <Input
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thứ tự</label>
              <Input
                type="number" min={1}
                value={sessionForm.orderIndex}
                onChange={(e) => setSessionForm({ ...sessionForm, orderIndex: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditSessionDialog(false)} disabled={saving}>Hủy</Button>
              <Button onClick={saveEditSession} disabled={!sessionForm.title.trim() || saving}>
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={(open) => { if (!open) { stopPolling(); setAnalyzeStatus('idle'); setUploadStatus('idle'); setUploadFile(null); } setLessonDialog(open); }}>
        <DialogContent className="w-[95vw] max-w-none max-h-[82vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? `Chỉnh sửa: ${editingLesson.title}` : `Thêm bài học vào "${selectedSessionForLesson?.title}"`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 mt-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên bài học *</label>
                <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="VD: Từ vựng gọi món..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
                <Input value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Mô tả ngắn..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại bài học</label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LESSON_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian (phút)</label>
                  <Input type="number" value={lessonForm.durationMinutes} onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })} className="mt-1" min={1} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thứ tự</label>
                  <Input type="number" value={lessonForm.orderIndex} onChange={(e) => setLessonForm({ ...lessonForm, orderIndex: Number(e.target.value) })} className="mt-1" min={1} />
                </div>
              </div>

              {/* Video fields - only show when type is VIDEO */}
              {lessonForm.type === 'VIDEO' && (
                <div className="border rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/30">
                  {/* Header */}
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900">
                    <Video className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Nội dung Video</span>
                    {!editingLesson && (
                      <span className="ml-auto text-xs text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                        ⚠ Lưu bài học trước, rồi chỉnh sửa để phân tích
                      </span>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-blue-100 dark:border-blue-900">
                    <button
                      onClick={() => setVideoTab('youtube')}
                      className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        videoTab === 'youtube'
                          ? 'bg-white dark:bg-gray-900 text-red-600 border-b-2 border-red-500'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      ▶ YouTube URL
                    </button>
                    <button
                      onClick={() => setVideoTab('upload')}
                      className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        videoTab === 'upload'
                          ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-500'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      ⬆ Upload từ máy
                    </button>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Tab 1: YouTube */}
                    {videoTab === 'youtube' && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Dán URL YouTube → hệ thống tự tải audio, AWS Transcribe, dịch VI, tạo IPA.
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={youtubeInputUrl}
                            onChange={(e) => setYoutubeInputUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="flex-1 font-mono text-xs bg-white dark:bg-gray-900"
                            disabled={analyzeStatus === 'submitting' || analyzeStatus === 'processing'}
                          />
                          <Button
                            size="sm"
                            onClick={() => editingLesson && analyzeYoutube(editingLesson.id)}
                            disabled={!youtubeInputUrl.trim() || !editingLesson || analyzeStatus === 'submitting' || analyzeStatus === 'processing'}
                            className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs gap-1"
                          >
                            {analyzeStatus === 'submitting' || analyzeStatus === 'processing'
                              ? <><span className="animate-spin inline-block">⏳</span> Xử lý...</>
                              : <>▶ Phân tích</>}
                          </Button>
                        </div>
                        {analyzeMessage && (
                          <p className={`text-xs px-2 py-1.5 rounded-md ${
                            analyzeStatus === 'done' ? 'text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300' :
                            analyzeStatus === 'error' ? 'text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300' :
                            'text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {analyzeMessage}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Upload from computer */}
                    {videoTab === 'upload' && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Upload file video/audio từ máy tính → tự động phân tích transcript.
                        </p>
                        <label
                          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                            uploadFile
                              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <input
                            type="file"
                            accept="video/*,audio/*,.mp4,.mp3,.wav,.m4a,.webm,.mov"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) { setUploadFile(f); setUploadStatus('idle'); setUploadMessage(''); setUploadProgress(0); }
                            }}
                            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                          />
                          {uploadFile ? (
                            <>
                              <span className="text-2xl">🎬</span>
                              <p className="text-xs font-medium text-blue-700 text-center">{uploadFile.name}</p>
                              <p className="text-xs text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl text-gray-300">⬆</span>
                              <p className="text-xs text-gray-500 text-center">Click để chọn file<br /><span className="text-gray-400">MP4, MP3, WAV, M4A, WebM...</span></p>
                            </>
                          )}
                        </label>

                        {uploadFile && uploadStatus === 'idle' && (
                          <Button
                            size="sm"
                            onClick={() => editingLesson && uploadAndTranscribe(editingLesson.id)}
                            disabled={!editingLesson}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                          >
                            ⬆ Upload & Phân tích transcript
                          </Button>
                        )}

                        {/* Progress bar */}
                        {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                          <div className="space-y-1">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {uploadMessage && (
                          <p className={`text-xs px-2 py-1.5 rounded-md ${
                            uploadStatus === 'done' ? 'text-green-700 bg-green-50' :
                            uploadStatus === 'error' ? 'text-red-700 bg-red-50' :
                            'text-blue-700 bg-blue-50'
                          }`}>
                            {uploadMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-blue-100 dark:border-blue-900 rounded-lg bg-white/70 dark:bg-gray-900/50 p-3">
              {scriptText ? (() => {
                let count = 0;
                let transcriptItems: any[] = [];
                try {
                  transcriptItems = JSON.parse(scriptText);
                  count = Array.isArray(transcriptItems) ? transcriptItems.length : 0;
                } catch { /* ignore */ }
                return (
                  <div className="h-full flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          ✅ Script ({count} câu)
                        </span>
                        <span className="text-[11px] text-gray-500">Tự động phân tích & dịch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => setScriptView('preview')}
                            className={`px-2 py-1 ${scriptView === 'preview' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
                          >
                            Xem đẹp
                          </button>
                          <button
                            type="button"
                            onClick={() => setScriptView('json')}
                            className={`px-2 py-1 border-l border-gray-200 dark:border-gray-700 ${scriptView === 'json' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
                          >
                            JSON
                          </button>
                        </div>
                        <button
                          onClick={() => setScriptText('')}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {scriptView === 'preview' && (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {Array.isArray(transcriptItems) && transcriptItems.length > 0 ? (
                          transcriptItems.map((item: any, index: number) => (
                            <div
                              key={item?.sentenceIndex ?? `${item?.start ?? index}-${index}`}
                              className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  Câu {item?.sentenceIndex ?? index + 1}
                                </span>
                                <span>{item?.start ?? 0}ms → {item?.end ?? 0}ms</span>
                              </div>
                              <div className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {item?.text ?? ''}
                              </div>
                              {item?.viText && (
                                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                  {item?.viText}
                                </div>
                              )}
                              {item?.ipa && (
                                <div className="mt-1 text-[11px] text-gray-500 italic">
                                  /{item.ipa}/
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">Không đọc được dữ liệu script.</div>
                        )}
                      </div>
                    )}

                    {scriptView === 'json' && (
                      <textarea
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs font-mono resize-none h-[360px]"
                        spellCheck={false}
                      />
                    )}
                  </div>
                );
              })() : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Script sẽ hiển thị tại đây sau khi phân tích.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLessonDialog(false)} disabled={saving || savingVideo}>Hủy</Button>
            <Button onClick={saveLesson} disabled={!lessonForm.title.trim() || saving || savingVideo}>
              {saving || savingVideo ? 'Đang lưu...' : editingLesson ? 'Cập nhật' : 'Thêm bài học'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={sessionDialog} onOpenChange={setSessionDialog}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              Thêm session vào "{selectedTopic?.name}"
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên session *</label>
              <Input
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="VD: Gọi món tại nhà hàng, Hỏi đường..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thứ tự</label>
              <Input
                type="number"
                value={sessionForm.orderIndex}
                onChange={(e) => setSessionForm({ ...sessionForm, orderIndex: Number(e.target.value) })}
                className="mt-1"
                min={1}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSessionDialog(false)} disabled={saving}>Hủy</Button>
              <Button onClick={saveSession} disabled={!sessionForm.title.trim() || saving}>
                {saving ? 'Đang lưu...' : 'Thêm session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
