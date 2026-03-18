import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Video } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLessonModal({ open, onOpenChange, onSuccess }: CreateLessonModalProps) {
  const [courses, setCourses] = useState<{ id: number; title?: string; name?: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: number; title?: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    durationMinutes: 5,
    orderIndex: 1,
  });

  const [createdLessonId, setCreatedLessonId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  const [youtubeInputUrl, setYoutubeInputUrl] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [scriptView, setScriptView] = useState<'preview' | 'json'>('preview');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTab, setVideoTab] = useState<'youtube' | 'upload'>('youtube');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState<'idle' | 'submitting' | 'processing' | 'done' | 'error'>('idle');
  const [analyzeMessage, setAnalyzeMessage] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setCreatedLessonId(null);
      setSelectedCourseId('');
      setSelectedSessionId('');
      setSessions([]);
      setLessonForm({ title: '', description: '', durationMinutes: 5, orderIndex: 1 });
      setYoutubeInputUrl('');
      setScriptText('');
      setVideoUrl('');
      setVideoTab('youtube');
      setUploadFile(null);
      setUploadStatus('idle');
      setAnalyzeStatus('idle');
      setScriptView('preview');
      const teacherId = useAuthStore.getState().user?.id;
      Promise.all([
        teacherId ? apiService.curriculum.getByTeacher(String(teacherId)) : Promise.resolve({ data: { data: [] } }),
        apiService.curriculum.getAll(),
      ]).then(([teacherRes, allRes]) => {
        const teacherList = (teacherRes.data?.data ?? []) as any[];
        const allList = (allRes.data?.data ?? []) as any[];
        const teacherArr = Array.isArray(teacherList) ? teacherList : [];
        const allArr = Array.isArray(allList) ? allList : [];
        const teacherIds = new Set(teacherArr.map((c: any) => String(c.id)));
        const merged = [...teacherArr, ...allArr.filter((c: any) => !teacherIds.has(String(c.id)))];
        setCourses(merged);
        if (teacherArr.length === 0 && teacherId) {
          apiService.curriculum.create({ title: 'Nội dung của tôi', teacherId: String(teacherId) })
            .then((curRes) => {
              const cur = curRes.data?.data ?? curRes.data;
              const cid = cur?.id;
              if (cid) {
                return apiService.session.create({ title: 'Bài học Video', courseId: cid, orderIndex: 1 })
                  .then((sessRes) => {
                    const sess = sessRes.data?.data ?? sessRes.data;
                    const sid = sess?.id;
                    setCourses((prev) => [{ ...cur, id: cid }, ...prev.filter((x: any) => x.id !== cid)]);
                    setSessions(sid ? [{ ...sess, id: sid }] : []);
                    if (cid) setSelectedCourseId(String(cid));
                    if (sid) setSelectedSessionId(String(sid));
                  });
              }
            })
            .catch(() => toast.error('Không tạo được khóa học của tôi'));
        }
      }).catch(() => setCourses([]));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = pollingRef.current;
    if (id) clearInterval(id);
    pollingRef.current = null;
    setAnalyzeStatus('idle');
    setUploadStatus('idle');
  }, [open]);

  useEffect(() => {
    if (!selectedCourseId) {
      setSessions([]);
      setSelectedSessionId('');
      return;
    }
    apiService.session.getByCourse(Number(selectedCourseId))
      .then((res) => {
        const list = res.data?.data ?? [];
        setSessions(Array.isArray(list) ? list : []);
        setSelectedSessionId('');
      })
      .catch(() => setSessions([]));
  }, [selectedCourseId]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const saveVideoContent = async (lessonId: number) => {
    if (!videoUrl.trim() && !scriptText.trim()) return;
    setSavingVideo(true);
    try {
      let transcriptJson: any[] | undefined;
      if (scriptText.trim()) {
        try {
          transcriptJson = JSON.parse(scriptText);
        } catch {
          toast.error('Script JSON không hợp lệ.');
          return;
        }
      }
      await apiService.lesson.saveVideo(lessonId, {
        videoUrl: videoUrl.trim() || undefined,
        transcriptJson,
      });
      toast.success('Đã lưu video và script');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lưu video thất bại');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = selectedSessionId ? Number(selectedSessionId) : null;
    if (!sessionId || !lessonForm.title.trim()) {
      toast.error('Chọn khóa học, session và nhập tên bài học.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiService.lesson.create({
        ...lessonForm,
        type: 'VIDEO',
        sessionId,
      });
      const created = res.data?.data ?? res.data;
      const id = created?.id != null ? Number(created.id) : null;
      if (id) {
        setCreatedLessonId(id);
        toast.success('Đã tạo bài học. Bạn có thể thêm link YouTube hoặc upload video.');
      } else {
        toast.error('Tạo bài học xong nhưng không lấy được ID.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tạo bài học');
    } finally {
      setSaving(false);
    }
  };

  const analyzeYoutube = async () => {
    if (!createdLessonId || !youtubeInputUrl.trim()) {
      toast.error('Nhập URL YouTube trước');
      return;
    }
    try {
      setAnalyzeStatus('submitting');
      setAnalyzeMessage('Đang gửi yêu cầu phân tích...');
      await apiService.transcribe.youtube({ lessonId: createdLessonId, youtubeUrl: youtubeInputUrl.trim() });
      setAnalyzeStatus('processing');
      setAnalyzeMessage('Đang xử lý... (có thể mất 1-3 phút)');
      toast.success('Đã gửi yêu cầu phân tích video YouTube');
      stopPolling();
      const id = setInterval(async () => {
        try {
          const res = await apiService.transcribe.getTranscript(createdLessonId);
          const data = res.data?.data ?? res.data;
          const transcript = Array.isArray(data) ? data : (data?.transcript ?? null);
          if (Array.isArray(transcript) && transcript.length > 0) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setAnalyzeStatus('done');
            setAnalyzeMessage(`✅ Hoàn thành! ${transcript.length} câu đã được phân tích và dịch.`);
            toast.success(`Phân tích xong! ${transcript.length} câu`);
            const lessonRes = await apiService.lesson.getById(createdLessonId);
            const l = lessonRes.data?.data ?? lessonRes.data;
            if (l?.transcriptJson) {
              try {
                setScriptText(JSON.stringify(l.transcriptJson, null, 2));
              } catch { /* ignore */ }
            }
            if (l?.youtubeUrl) setYoutubeInputUrl(l.youtubeUrl);
          }
        } catch { /* keep polling */ }
      }, 8000);
      pollingRef.current = id;
    } catch (err: any) {
      setAnalyzeStatus('error');
      setAnalyzeMessage('Lỗi: ' + (err?.response?.data?.message ?? err?.message ?? 'Không kết nối được'));
      toast.error('Gửi yêu cầu thất bại');
    }
  };

  const uploadAndTranscribe = async () => {
    if (!createdLessonId || !uploadFile) {
      toast.error('Chọn file video trước');
      return;
    }
    try {
      stopPolling();
      setUploadStatus('uploading');
      setUploadMessage('Đang upload lên server...');
      setUploadProgress(10);
      await apiService.transcribe.upload(createdLessonId, uploadFile, 'en-US');
      setUploadStatus('processing');
      setUploadProgress(50);
      setUploadMessage('Upload xong! Đang phân tích âm thanh, dịch tiếng Việt, tạo IPA...');
      toast.success('Upload thành công! Đang xử lý transcript...');
      const id = setInterval(async () => {
        try {
          const res = await apiService.transcribe.getTranscript(createdLessonId);
          const data = res.data?.data ?? res.data;
          const transcript = Array.isArray(data) ? data : (data?.transcript ?? null);
          if (Array.isArray(transcript) && transcript.length > 0) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setUploadStatus('done');
            setUploadProgress(100);
            setUploadMessage(`✅ Hoàn thành! ${transcript.length} câu đã được phân tích và dịch.`);
            toast.success(`Xử lý xong! ${transcript.length} câu`);
            const lessonRes = await apiService.lesson.getById(createdLessonId);
            const l = lessonRes.data?.data ?? lessonRes.data;
            if (l?.transcriptJson) {
              try {
                setScriptText(JSON.stringify(l.transcriptJson, null, 2));
              } catch { /* ignore */ }
            }
          }
        } catch { /* keep polling */ }
      }, 8000);
      pollingRef.current = id;
    } catch (err: any) {
      setUploadStatus('error');
      setUploadProgress(0);
      setUploadMessage('Lỗi: ' + (err?.response?.data?.message ?? err?.message ?? 'Upload thất bại'));
      toast.error('Upload thất bại');
    }
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      stopPolling();
      setAnalyzeStatus('idle');
      setUploadStatus('idle');
      setUploadFile(null);
    }
    onOpenChange(openState);
  };

  const handleFinish = async () => {
    if (createdLessonId && (videoUrl.trim() || scriptText.trim())) {
      await saveVideoContent(createdLessonId);
    }
    onSuccess?.();
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {createdLessonId ? 'Thêm nội dung Video' : 'Tạo bài học Video'}
          </DialogTitle>
          <DialogDescription>
            {createdLessonId
              ? 'Thêm link YouTube hoặc upload file video để tự động phân tích transcript.'
              : 'Chọn khóa học và session, sau đó tạo bài học. Chỉ hỗ trợ loại Video (giống quản trị).'}
          </DialogDescription>
        </DialogHeader>

        {!createdLessonId ? (
          <form onSubmit={handleCreateLesson} className="space-y-4 mt-2">
            <div>
              <Label>Khóa học *</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title || c.name || `Khóa ${c.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session *</Label>
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId} disabled={!selectedCourseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.title || `Session ${s.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tên bài học *</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="VD: Từ vựng gọi món..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Mô tả ngắn..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  value={lessonForm.durationMinutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                  className="mt-1"
                  min={1}
                />
              </div>
              <div>
                <Label>Thứ tự</Label>
                <Input
                  type="number"
                  value={lessonForm.orderIndex}
                  onChange={(e) => setLessonForm({ ...lessonForm, orderIndex: Number(e.target.value) })}
                  className="mt-1"
                  min={1}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!lessonForm.title.trim() || !selectedSessionId || saving}>
                {saving ? 'Đang tạo...' : 'Tạo bài học'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="border rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/30">
              <div className="px-3 py-2 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900">
                <Video className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Nội dung Video</span>
              </div>
              <div className="flex border-b border-blue-100 dark:border-blue-900">
                <button
                  type="button"
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
                  type="button"
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
                {videoTab === 'youtube' && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Dán URL YouTube → hệ thống tự tải audio, phân tích, dịch VI, tạo IPA.
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
                        onClick={analyzeYoutube}
                        disabled={!youtubeInputUrl.trim() || analyzeStatus === 'submitting' || analyzeStatus === 'processing'}
                        className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs gap-1"
                      >
                        {analyzeStatus === 'submitting' || analyzeStatus === 'processing'
                          ? <>⏳ Xử lý...</>
                          : <>▶ Phân tích</>}
                      </Button>
                    </div>
                    {analyzeMessage && (
                      <p
                        className={`text-xs px-2 py-1.5 rounded-md ${
                          analyzeStatus === 'done'
                            ? 'text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300'
                            : analyzeStatus === 'error'
                              ? 'text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300'
                              : 'text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {analyzeMessage}
                      </p>
                    )}
                  </div>
                )}

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
                          if (f) {
                            setUploadFile(f);
                            setUploadStatus('idle');
                            setUploadMessage('');
                            setUploadProgress(0);
                          }
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
                          <p className="text-xs text-gray-500 text-center">
                            Click để chọn file
                            <br />
                            <span className="text-gray-400">MP4, MP3, WAV, M4A, WebM...</span>
                          </p>
                        </>
                      )}
                    </label>
                    {uploadFile && uploadStatus === 'idle' && (
                      <Button
                        size="sm"
                        onClick={uploadAndTranscribe}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                      >
                        ⬆ Upload & Phân tích transcript
                      </Button>
                    )}
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
                      <p
                        className={`text-xs px-2 py-1.5 rounded-md ${
                          uploadStatus === 'done'
                            ? 'text-green-700 bg-green-50'
                            : uploadStatus === 'error'
                              ? 'text-red-700 bg-red-50'
                              : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {uploadMessage}
                      </p>
                    )}
                  </div>
                )}

                {scriptText && (
                  (() => {
                    let count = 0;
                    let transcriptItems: any[] = [];
                    try {
                      transcriptItems = JSON.parse(scriptText);
                      count = Array.isArray(transcriptItems) ? transcriptItems.length : 0;
                    } catch {
                      /* ignore */
                    }
                    return (
                      <div className="border-t border-blue-100 dark:border-blue-900 pt-3">
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
                              type="button"
                              onClick={() => setScriptText('')}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {scriptView === 'preview' && (
                          <div className="space-y-2">
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
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs font-mono resize-none"
                            rows={6}
                            spellCheck={false}
                          />
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreatedLessonId(null)}>
                Quay lại
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => createdLessonId && saveVideoContent(createdLessonId)}
                disabled={savingVideo || (!videoUrl.trim() && !scriptText.trim())}
              >
                {savingVideo ? 'Đang lưu...' : 'Lưu video'}
              </Button>
              <Button type="button" onClick={handleFinish} disabled={savingVideo}>
                Hoàn tất
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
