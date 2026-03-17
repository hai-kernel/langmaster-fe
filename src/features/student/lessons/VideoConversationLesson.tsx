import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
  AlignLeft,
  Loader2,
  ChevronDown,
  ChevronRight,
  Mic,
  Video,
  VideoOff,
  BookOpen,
  BookmarkPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import { API_BASE_URL } from '@/services/baseUrl';
import { useAppStore } from '@/store/appStore';
import { RecordingButton } from '@/shared/ui/RecordingButton';
import type { PronunciationScoreResponse } from '@/services/apiService';

interface TranscriptLine {
  sentenceIndex: number;
  start: number;   // ms
  end: number;     // ms
  text: string;
  viText?: string;
  ipa?: string;    // IPA toàn câu, từng từ cách nhau bởi khoảng trắng
}

interface WordInfo {
  text: string;
  ipa?: string;
  meaning?: string;
  /** Câu chứa từ (gốc) – dùng làm câu ví dụ khi lưu */
  sentenceText?: string;
  /** Câu dịch (tiếng Việt) – dùng làm câu ví dụ khi lưu */
  sentenceViText?: string;
}

// Ghép từng từ với IPA tương ứng.
// espeak-ng xuất IPA theo từng từ cách nhau bởi khoảng trắng, nên ta split & ghép theo index.
// Xử lý dấu câu dính vào từ (hello, → hello) để đếm đúng.
function buildWordIpaPairs(text: string, ipa: string): Array<{ word: string; ipa: string }> {
  const rawWords = text.split(/\s+/).filter(Boolean);
  if (!ipa || !ipa.trim()) {
    return rawWords.map(w => ({ word: w, ipa: '' }));
  }
  // Lấy phần chữ của từ (bỏ dấu câu đầu/cuối) để so khớp số lượng với IPA
  const cleanWord = (w: string) => w.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
  const ipaParts = ipa.trim().split(/\s+/).filter(Boolean);
  // Ghép từng từ gốc (có dấu câu) với IPA tương ứng
  let ipaIdx = 0;
  return rawWords.map(word => {
    const clean = cleanWord(word);
    const wordIpa = clean ? (ipaParts[ipaIdx++] ?? '') : '';
    return { word, ipa: wordIpa };
  });
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Lấy lesson object từ response API (hỗ trợ nhiều dạng bọc: data, data.data, data.lesson) và chuẩn hóa videoUrl. */
function normalizeLessonFromApi(resData: any): any {
  if (resData == null) return null;
  const raw = resData?.data ?? resData?.lesson ?? resData;
  if (!raw || typeof raw !== 'object') return raw;
  const videoUrl = (typeof raw.videoUrl === 'string' && raw.videoUrl.trim())
    ? raw.videoUrl.trim()
    : (typeof raw.video_url === 'string' && raw.video_url.trim())
      ? raw.video_url.trim()
      : '';
  return { ...raw, videoUrl };
}

// ─── Toggle Pill: một màu chủ đạo (Indigo #4F46E5) khi active ─────────────────
const ACTIVE_COLOR = '#4F46E5';

function TogglePill({
  active, onClick, label,
}: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all select-none ${
        active
          ? 'border-transparent text-white shadow-sm'
          : 'bg-transparent text-muted-foreground border-border hover:border-[#4F46E5]/40 hover:text-foreground'
      }`}
      style={active ? { backgroundColor: ACTIVE_COLOR } : undefined}
    >
      {label}
    </button>
  );
}

/** Điểm tổng từ các chỉ số phát âm (0–100). */
function overallFromResponse(d: PronunciationScoreResponse | null): number {
  if (!d) return 0;
  const p = d.pronunciationScore ?? 0;
  const a = d.accuracyScore ?? 0;
  const f = d.fluencyScore ?? 0;
  const pr = d.prosodyScore ?? 0;
  const c = d.completenessScore ?? 0;
  const arr = [p, a, f, pr, c].filter((x) => x != null && !Number.isNaN(x));
  return arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0;
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreBg(score: number) {
  if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 75) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

function getAccuracyLevel(score?: number) {
  if (score == null) return 'unknown';
  if (score >= 85) return 'good';
  if (score >= 70) return 'ok';
  return 'bad';
}

function getAccuracyClasses(score?: number) {
  const level = getAccuracyLevel(score);
  if (level === 'good') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (level === 'ok') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (level === 'bad') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
}

export function VideoConversationLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [lesson, setLesson] = useState<any>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState(-1);
  const [ytReady, setYtReady] = useState(false);

  // Display toggles – word IPA bật mặc định vì data API đã có sẵn
  const [showScript, setShowScript] = useState(true);
  const [showOverlaySub, setShowOverlaySub] = useState(true); // subtitle overlay trên video
  const [showVI, setShowVI] = useState(true);
  const [showIPA, setShowIPA] = useState(false);      // sentence IPA: tắt mặc định (tránh trùng với word IPA)
  const [showWordIPA, setShowWordIPA] = useState(true); // word IPA: bật mặc định
  const [playbackRate, setPlaybackRate] = useState(1);

  // Tra cứu từ vựng / cấu trúc
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [wordLoading, setWordLoading] = useState(false);
  const [savedWordId, setSavedWordId] = useState<string | null>(null); // word (lowercase) đã lưu trong phiên này
  const [grammarExplainIdx, setGrammarExplainIdx] = useState<number | null>(null);
  const [grammarExplainText, setGrammarExplainText] = useState<string>('');

  // Thoại theo (shadowing): xem xong → chọn thoại lại từng câu + chấm phát âm
  const [mode, setMode] = useState<'watch' | 'shadowing'>('watch');
  /** Thu âm bình thường: từng câu, chấm ngay. Karaoke: nói theo video, hệ thống tự thu từng câu, xử lý một lượt cuối. */
  const [shadowingSubMode, setShadowingSubMode] = useState<'normal' | 'karaoke'>('normal');
  const [showVideoInShadowing, setShowVideoInShadowing] = useState(true);
  const [sentenceScores, setSentenceScores] = useState<Record<number, PronunciationScoreResponse>>({});
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [lastRecordedAudioUrl, setLastRecordedAudioUrl] = useState<string | null>(null);
  const [lastScoredSentenceIndex, setLastScoredSentenceIndex] = useState<number | null>(null);
  const [recordingForSentenceIndex, setRecordingForSentenceIndex] = useState<number | null>(null);
  const [scoringSentenceIndex, setScoringSentenceIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Karaoke: nói theo tốc độ video, thu từng câu theo thời gian, xử lý hàng loạt cuối
  const [karaokeActive, setKaraokeActive] = useState(false);
  const [karaokeRecordedBlobs, setKaraokeRecordedBlobs] = useState<Record<number, Blob>>({});
  const [karaokeRecordingSentence, setKaraokeRecordingSentence] = useState<number | null>(null);
  const [karaokeResults, setKaraokeResults] = useState<Record<number, PronunciationScoreResponse>>({});
  const [karaokeProcessing, setKaraokeProcessing] = useState(false);
  const [karaokeProcessingProgress, setKaraokeProcessingProgress] = useState<string>('');
  const [karaokeSummaryVisible, setKaraokeSummaryVisible] = useState(false);
  const karaokeRecordingSentenceRef = useRef<number | null>(null);
  const karaokeMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const karaokeChunksRef = useRef<Blob[]>([]);
  const karaokeStreamRef = useRef<MediaStream | null>(null);
  const karaokeRecordedBlobsRef = useRef<Record<number, Blob>>({});

  // (Đã bỏ countdown 3-2-1: vào shadowing và bắt đầu karaoke ngay khi nhấn nút)

  const lastRecordedAudioUrlRef = useRef<string | null>(null);
  useEffect(() => {
    lastRecordedAudioUrlRef.current = lastRecordedAudioUrl;
    return () => {
      if (lastRecordedAudioUrlRef.current) URL.revokeObjectURL(lastRecordedAudioUrlRef.current);
    };
  }, [lastRecordedAudioUrl]);

  const isYoutube = !!(lesson?.youtubeUrl && extractYoutubeId(lesson.youtubeUrl));
  const ytVideoId = isYoutube ? extractYoutubeId(lesson?.youtubeUrl) : null;
  // URL video: API có thể trả về videoUrl (camelCase) hoặc video_url (snake_case)
  const displayVideoUrl = lesson && (
    (typeof lesson.videoUrl === 'string' && lesson.videoUrl.trim()) ||
    (typeof (lesson as any).video_url === 'string' && (lesson as any).video_url.trim())
  ) ? ((lesson.videoUrl || (lesson as any).video_url) as string).trim() : '';
  // Tránh CORS: nếu video từ S3 (presigned hoặc public URL) thì phát qua proxy backend (same-origin).
  const isS3VideoUrl = !!(displayVideoUrl && (displayVideoUrl.includes('amazonaws.com') || displayVideoUrl.includes('X-Amz')));
  const videoSrcForPlayer = (displayVideoUrl && lessonId && isS3VideoUrl)
    ? `${API_BASE_URL}/v1/lessons/${lessonId}/video-stream`
    : displayVideoUrl;
  // Chỉ dùng videoUrl để phát native khi KHÔNG phải URI S3 nội bộ (s3://...)
  const hasNativeVideo = !!(videoSrcForPlayer && !displayVideoUrl.startsWith('s3://'));

  // ── Load lesson ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    apiService.lesson.getById(Number(lessonId))
      .then((res) => {
        const data = normalizeLessonFromApi(res.data);
        setLesson(data);
        if (!data) return;
        if (Array.isArray(data.transcriptJson) && data.transcriptJson.length > 0) {
          setTranscript(data.transcriptJson as TranscriptLine[]);
        } else if (data.s3Status === 'PROCESSING') {
          pollRef.current = setInterval(async () => {
            try {
              const r = await apiService.transcribe.getTranscript(Number(lessonId));
              const payload = r.data?.data ?? r.data;
              const transcriptList = Array.isArray(payload) ? payload : (payload?.transcript ?? null);
              if (Array.isArray(transcriptList) && transcriptList.length > 0) {
                if (pollRef.current) clearInterval(pollRef.current);
                pollRef.current = null;
                setTranscript(transcriptList as TranscriptLine[]);
                const lessonRes = await apiService.lesson.getById(Number(lessonId));
                const updated = normalizeLessonFromApi(lessonRes.data);
                if (updated) setLesson(updated);
                toast.success('Transcript đã sẵn sàng!');
              }
            } catch { /* ignore */ }
          }, 10000);
        }
      })
      .catch(() => toast.error('Không tải được bài học'))
      .finally(() => setLoading(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [lessonId]);

  // ── Scroll active line into view ─────────────────────────────────────────────
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeLineIdx]);

  // ── Active line detection ────────────────────────────────────────────────────
  const updateActiveLine = useCallback((ms: number) => {
    const idx = transcript.findIndex((l, i) =>
      ms >= l.start && (i === transcript.length - 1 || ms < transcript[i + 1].start)
    );
    setActiveLineIdx(idx);
  }, [transcript]);

  // ── YouTube iframe API ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ytVideoId) return;
    const init = () => {
      ytPlayerRef.current = new (window as any).YT.Player('yt-player', {
        videoId: ytVideoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setYtReady(true),
          onStateChange: (e: any) => setIsPlaying(e.data === 1),
        },
      });
    };
    if ((window as any).YT?.Player) init();
    else {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = init;
    }
  }, [ytVideoId]);

  useEffect(() => {
    if (!ytReady || !ytVideoId) return;
    const id = setInterval(() => {
      if (ytPlayerRef.current?.getCurrentTime) {
        const ms = ytPlayerRef.current.getCurrentTime() * 1000;
        setCurrentMs(ms);
        updateActiveLine(ms);
      }
    }, 200);
    return () => clearInterval(id);
  }, [ytReady, ytVideoId, updateActiveLine]);

  // ── Native video handlers ────────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const ms = videoRef.current.currentTime * 1000;
    setCurrentMs(ms);
    updateActiveLine(ms);
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const seekToLine = (line: TranscriptLine) => {
    const seconds = line.start / 1000;
    if (ytVideoId && ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(seconds, true);
      ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (ytVideoId && ytPlayerRef.current) {
      if (isPlaying) ytPlayerRef.current.pauseVideo(); else ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (ytVideoId && ytPlayerRef.current) {
      if (isMuted) ytPlayerRef.current.unMute(); else ytPlayerRef.current.mute();
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Tốc độ phát: 0.75x, 1x, 1.25x
  const setPlaybackRateVideo = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (ytVideoId && ytPlayerRef.current?.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(rate);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, [ytVideoId]);

  const handleComplete = async () => {
    const scoresFromNormal = Object.values(sentenceScores);
    const scoresFromKaraoke = Object.values(karaokeResults).filter((d) => d.status !== 'FAILED' && overallFromResponse(d) > 0);
    const allScores = scoresFromNormal.length > 0 ? scoresFromNormal : scoresFromKaraoke;
    const avgScore = allScores.length > 0
      ? Math.round(allScores.reduce((s, d) => s + overallFromResponse(d), 0) / allScores.length)
      : undefined;
    try {
      await apiService.student.completeLesson(lessonId!, avgScore ?? 100);
      useAppStore.getState().invalidateProgress();
      toast.success('Đã lưu thành tích và hoàn thành bài học!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lưu thành tích thất bại. Thử lại sau.');
      return;
    }
    navigate(-1);
  };

  // ── Tra từ vựng: click vào từ để xem nghĩa + IPA; lưu cả câu gốc/dịch làm ví dụ ─────────────────────────────
  const handleWordClick = useCallback(
    async (
      rawWord: string,
      ipaFromSentence?: string,
      viHint?: string,
      sentence?: { text: string; viText?: string }
    ) => {
      const clean = rawWord.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
      if (!clean) return;
      setSelectedWord({
        text: clean,
        ipa: ipaFromSentence,
        meaning: viHint,
        sentenceText: sentence?.text,
        sentenceViText: sentence?.viText,
      });
      setWordLoading(true);
      try {
        const res = await apiService.vocabulary.search(clean.toLowerCase());
        const list = res.data?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0];
          const firstMeaning =
            Array.isArray(first.meanings) && first.meanings.length > 0
              ? first.meanings[0].def || first.meanings[0].definition
              : undefined;
          setSelectedWord((prev) =>
            prev && prev.text.toLowerCase() === clean.toLowerCase()
              ? {
                  ...prev,
                  ipa: prev.ipa || first.ipa || first.phonetic,
                  meaning: firstMeaning || prev.meaning,
                }
              : prev
          );
        }
      } catch {
        // fallback: giữ meaning từ viHint nếu có
      } finally {
        setWordLoading(false);
      }
    },
    []
  );

  // ── Phân tích ngữ pháp câu: Accordion — click mở/đóng ───────────────────────
  const handleGrammarExplain = useCallback(
    async (idx: number, text: string) => {
      if (!text.trim()) return;
      // Toggle: đang mở cùng câu thì đóng
      if (grammarExplainIdx === idx) {
        setGrammarExplainIdx(null);
        return;
      }
      setGrammarExplainIdx(idx);
      setGrammarExplainText('Đang phân tích cấu trúc ngữ pháp câu này...');
      try {
        const res = await apiService.ai.chat({
          messages: [
            {
              role: 'user',
              content:
                'Phân tích ngữ pháp câu tiếng Anh sau, giải thích ngắn gọn bằng tiếng Việt, tập trung vào thì, cấu trúc câu, và cụm từ quan trọng:\n\n"' +
                text +
                '"',
            },
          ],
          lessonContext: lesson?.title || 'Video conversation',
        });
        const content = res.data?.data?.content || res.data?.data || '';
        setGrammarExplainText(content || 'Không nhận được phân tích từ hệ thống.');
      } catch {
        setGrammarExplainText('Có lỗi khi gọi phân tích ngữ pháp. Thử lại sau.');
      }
    },
    [lesson?.title, grammarExplainIdx]
  );

  // ── Thoại theo: thu âm từng câu và gọi API chấm phát âm ────────────────────
  const startRecordingForSentence = useCallback(async (sentenceIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
        setRecordingForSentenceIndex(null);
        setIsRecording(false);
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
          : null;
        if (!lessonId || blob == null) {
          toast.error('Không có bản ghi âm. Thử lại.');
          return;
        }
        const idx = sentenceIndex;
        setLastRecordedAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setLastScoredSentenceIndex(idx);
        setScoringSentenceIndex(idx);
        const expectedText = transcript[idx]?.text?.trim();
        setLastResponse(null);
        try {
          const res = await apiService.pronunciation.getScore(Number(lessonId), sentenceIndex, blob, expectedText);
          const data = res.data?.data;
          if (data) {
            setLastResponse(res.data);
            setSentenceScores((prev) => {
              const next = { ...prev, [sentenceIndex]: data };
              const scores = Object.values(next);
              const avg =
                scores.length > 0
                  ? Math.round(
                      scores.reduce((sum, s) => sum + overallFromResponse(s), 0) / scores.length
                    )
                  : 0;
              const thisOverall = overallFromResponse(data);
              toast.success(`Câu ${sentenceIndex + 1}: ${thisOverall} điểm`);
              if (!autoCompleted && avg >= 80) {
                setAutoCompleted(true);
                toast.success(`Điểm trung bình ${avg}%. Hệ thống tự động hoàn thành bài học!`);
                // Lưu tiến độ lên server ngay khi đạt ngưỡng
                apiService.student.completeLesson(lessonId!, avg).then(() => {
                  useAppStore.getState().invalidateProgress();
                  toast.success('Đã lưu thành tích!');
                }).catch(() => {
                  toast.error('Lưu thành tích thất bại. Bạn có thể bấm "Hoàn thành bài học" để thử lại.');
                });
              }
              return next;
            });
          } else {
            toast.error('Không nhận được kết quả chấm điểm');
          }
        } catch (err: any) {
          setLastResponse(err?.response?.data ?? null);
          const status = err?.response?.status;
          const msg = err?.response?.data?.message || err?.message || '';
          if (status === 500) {
            toast.error('Máy chủ tạm thời bận. Vui lòng thử lại sau (ghi âm ngắn dưới 15 giây).');
          } else {
            toast.error(msg || 'Chấm phát âm thất bại. Thử lại.');
          }
        } finally {
          setScoringSentenceIndex(null);
        }
      };
      mr.start(200);
      setRecordingForSentenceIndex(sentenceIndex);
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => Math.min(t + 1, 60));
      }, 1000);
    } catch {
      toast.error('Không thể truy cập micro. Kiểm tra quyền trình duyệt.');
    }
  }, [lessonId, transcript]);

  const stopRecordingForSentence = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Karaoke: thu âm theo từng câu theo thời gian video (không gọi API ngay) ──
  const startKaraokeRecording = useCallback(async (sentenceIndex: number) => {
    if (karaokeRecordingSentenceRef.current !== null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      karaokeStreamRef.current = stream;
      karaokeChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      karaokeMediaRecorderRef.current = mr;
      karaokeRecordingSentenceRef.current = sentenceIndex;
      setKaraokeRecordingSentence(sentenceIndex);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) karaokeChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const idx = karaokeRecordingSentenceRef.current;
        karaokeRecordingSentenceRef.current = null;
        setKaraokeRecordingSentence(null);
        const blob = karaokeChunksRef.current.length
          ? new Blob(karaokeChunksRef.current, { type: mr.mimeType || 'audio/webm' })
          : null;
        if (idx != null && blob != null) {
          setKaraokeRecordedBlobs((prev) => {
            const next = { ...prev, [idx]: blob };
            karaokeRecordedBlobsRef.current = next;
            return next;
          });
        }
      };
      mr.start(200);
    } catch {
      toast.error('Không thể truy cập micro. Kiểm tra quyền trình duyệt.');
      karaokeRecordingSentenceRef.current = null;
      setKaraokeRecordingSentence(null);
    }
  }, []);

  const stopKaraokeRecording = useCallback(() => {
    if (karaokeMediaRecorderRef.current && karaokeMediaRecorderRef.current.state !== 'inactive') {
      karaokeMediaRecorderRef.current.stop();
    }
  }, []);

  // Karaoke: đồng bộ thu âm với thời gian video. Thêm padding trước/sau để thu trọn lời nói (giống API thu từng câu).
  const KARAOKE_PADDING_START_MS = 250;
  const KARAOKE_PADDING_END_MS = 500;
  useEffect(() => {
    if (!karaokeActive || transcript.length === 0 || !lessonId) return;
    const ms = currentMs;
    const idx = transcript.findIndex((l, i) =>
      ms >= l.start && (i === transcript.length - 1 || ms < transcript[i + 1].start)
    );

    // Đang thu câu nào đó: dừng khi qua end + padding (tránh cắt mất cuối câu)
    if (karaokeRecordingSentenceRef.current !== null) {
      const recIdx = karaokeRecordingSentenceRef.current;
      const line = transcript[recIdx];
      const endMs = (line?.end ?? line.start + 5000) + KARAOKE_PADDING_END_MS;
      if (ms >= endMs) {
        stopKaraokeRecording();
      }
      return;
    }

    // Chưa thu: bắt đầu thu khi vào start − padding (để bắt kịp đầu câu)
    const recorded = karaokeRecordedBlobsRef.current;
    if (idx >= 0 && !recorded[idx]) {
      const line = transcript[idx];
      const startMs = Math.max(0, line.start - KARAOKE_PADDING_START_MS);
      const endMs = (line.end ?? line.start + 5000) + KARAOKE_PADDING_END_MS;
      if (ms >= startMs && ms < endMs) {
        startKaraokeRecording(idx);
      }
    }
  }, [karaokeActive, currentMs, transcript, startKaraokeRecording, stopKaraokeRecording, lessonId]);

  // Xử lý hàng loạt karaoke: gọi API chấm từng câu đã thu, tổng hợp kết quả + gợi ý cải thiện
  const processKaraokeResults = useCallback(async (blobsOverride?: Record<number, Blob>) => {
    const blobs = blobsOverride ?? karaokeRecordedBlobsRef.current;
    const indices = Object.keys(blobs).map(Number).sort((a, b) => a - b);
    if (indices.length === 0) {
      toast.error('Chưa có bản ghi âm nào. Hãy bật Karaoke và nói theo video.');
      return;
    }
    setKaraokeProcessing(true);
    setKaraokeProcessingProgress(`Đang chuẩn bị... (0/${indices.length} câu)`);
    setKaraokeSummaryVisible(false);
    const results: Record<number, PronunciationScoreResponse> = {};
    const errors: number[] = [];
    let done = 0;
    for (const i of indices) {
      setKaraokeProcessingProgress(`Đang chấm câu ${done + 1}/${indices.length}...`);
      const blob = blobs[i];
      const expectedText = transcript[i]?.text?.trim();
      if (!blob || !lessonId) continue;
      try {
        const res = await apiService.pronunciation.getScore(Number(lessonId), i, blob, expectedText);
        const data = res.data?.data;
        if (data) {
          results[i] = data;
          if (data.status === 'FAILED' && data.errorMessage) {
            errors.push(i + 1);
          }
        } else {
          errors.push(i + 1);
        }
      } catch {
        errors.push(i + 1);
      }
      done += 1;
    }
    setKaraokeProcessingProgress('');
    setKaraokeResults(results);
    setKaraokeProcessing(false);
    setKaraokeSummaryVisible(true);
    if (errors.length > 0) {
      toast.error(`Không chấm được hoặc timeout: câu ${errors.join(', ')}. Có thể âm quá ngắn hoặc im lặng. Thử thu lại.`);
    }
    const successResults = Object.values(results).filter((d) => d.status !== 'FAILED' && overallFromResponse(d) > 0);
    if (successResults.length > 0) {
      const avg = Math.round(
        successResults.reduce((s, d) => s + overallFromResponse(d), 0) / successResults.length
      );
      toast.success(`Đã xử lý ${indices.length} câu. Điểm trung bình (câu thành công): ${avg}%`);
      if (lessonId && avg >= 80) {
        setAutoCompleted(true);
        apiService.student.completeLesson(lessonId, avg).then(() => {
          useAppStore.getState().invalidateProgress();
          toast.success('Đã lưu thành tích!');
        }).catch(() => {
          toast.error('Lưu thành tích thất bại. Bạn có thể bấm "Hoàn thành bài học" để thử lại.');
        });
      }
    }
  }, [transcript, lessonId]);

  const startKaraokeSession = useCallback(() => {
    if (transcript.length === 0) return;
    karaokeRecordedBlobsRef.current = {};
    setKaraokeRecordedBlobs({});
    setKaraokeResults({});
    setKaraokeSummaryVisible(false);
    setKaraokeActive(true);
    // Tắt tiếng video khi thu karaoke để mic không bắt âm thanh từ loa, nâng chất lượng thu
    if (ytVideoId && ytPlayerRef.current?.mute) {
      ytPlayerRef.current.mute();
    } else if (videoRef.current) {
      videoRef.current.muted = true;
    }
    setIsMuted(true);
    seekToLine(transcript[0]);
    if (ytVideoId && ytPlayerRef.current?.playVideo) {
      ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    toast.info('Video đã tắt tiếng khi thu để tránh lẫn âm. Nói theo phụ đề.');
  }, [transcript]);

  const endKaraokeSession = useCallback(() => {
    setKaraokeActive(false);
    // Bật lại tiếng video sau khi kết thúc thu
    if (ytVideoId && ytPlayerRef.current?.unMute) {
      ytPlayerRef.current.unMute();
    } else if (videoRef.current) {
      videoRef.current.muted = false;
    }
    setIsMuted(false);
    stopKaraokeRecording();
    // Đợi onstop của recorder cập nhật ref rồi xử lý hàng loạt
    setTimeout(() => {
      const blobs = karaokeRecordedBlobsRef.current;
      const count = Object.keys(blobs).length;
      if (count > 0) {
        processKaraokeResults(blobs);
      } else {
        toast.info('Chưa thu câu nào. Bật lại Karaoke và nói theo video.');
      }
    }, 600);
  }, [processKaraokeResults, stopKaraokeRecording]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center" style={{ backgroundColor: 'var(--page-bg)' }}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  const currentLine = activeLineIdx >= 0 ? transcript[activeLineIdx] : null;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--page-bg)' }}>
      {/* Overlay đang xử lý Karaoke — chờ chấm điểm từng câu */}
      {karaokeProcessing && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="bg-card rounded-2xl shadow-xl border p-8 max-w-sm mx-4 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-semibold text-foreground text-center">Đang xử lý bài thu âm Karaoke</p>
            <p className="text-sm text-muted-foreground text-center">
              {karaokeProcessingProgress || 'Đang chấm điểm từng câu...'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Vui lòng đợi, không đóng trang.
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-4 lg:py-6 space-y-6">

        {/* ── Header: nút Quay lại tinh tế + khoảng cách rõ ràng ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">VIDEO</Badge>
            {lesson?.durationMinutes && <Badge variant="outline">{lesson.durationMinutes} phút</Badge>}
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{lesson?.title ?? 'Bài học Video'}</h1>
          {lesson?.description && <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>}
        </div>

        {/* ── Toolbar: nền #F8F9FB, một màu active Indigo ── */}
        {transcript.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-border/80 bg-[#F8F9FB] dark:bg-gray-900/50">
            <span className="text-xs font-medium text-muted-foreground mr-1">Hiển thị:</span>
            <TogglePill active={showOverlaySub} onClick={() => setShowOverlaySub(v => !v)} label="Subtitle video" />
            <TogglePill active={showScript} onClick={() => setShowScript(v => !v)} label="Script" />
            <TogglePill active={showVI} onClick={() => setShowVI(v => !v)} label="Dịch tiếng Việt" />
            <TogglePill active={showIPA} onClick={() => setShowIPA(v => !v)} label="IPA câu" />
            <TogglePill active={showWordIPA} onClick={() => setShowWordIPA(v => !v)} label="IPA từng từ" />
          </div>
        )}

        {/* ── Chế độ thoại theo: Thu âm bình thường | Karaoke + Ẩn/Hiện video ── */}
        {mode === 'shadowing' && transcript.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <Mic className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-medium text-foreground">Chế độ:</span>
            <TogglePill
              active={shadowingSubMode === 'normal'}
              onClick={() => { setShadowingSubMode('normal'); setKaraokeActive(false); setKaraokeSummaryVisible(false); }}
              label="Thu âm bình thường"
            />
            <TogglePill
              active={shadowingSubMode === 'karaoke'}
              onClick={() => { setShadowingSubMode('karaoke'); setKaraokeSummaryVisible(false); }}
              label="Karaoke (nói theo video)"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoInShadowing((v) => !v)}
              className="gap-2"
            >
              {showVideoInShadowing ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {showVideoInShadowing ? 'Ẩn video' : 'Hiện video'}
            </Button>
            {shadowingSubMode === 'normal' && (
              <span className="text-xs text-muted-foreground ml-auto">
                {Object.keys(sentenceScores).length}/{transcript.length} câu đã chấm
              </span>
            )}
            {shadowingSubMode === 'karaoke' && (
              <span className="text-sm text-muted-foreground ml-auto font-medium">
                {karaokeActive ? (
                  <span className="inline-flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                    <span className="text-red-600 dark:text-red-400 inline-flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-ping opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                      </span>
                      Đang thu âm · {Object.keys(karaokeRecordedBlobs).length}/{transcript.length} câu
                    </span>
                    <span className="text-xs text-muted-foreground">(Video tắt tiếng để thu rõ)</span>
                  </span>
                ) : (
                  <span>{Object.keys(karaokeRecordedBlobs).length}/{transcript.length} câu đã thu</span>
                )}
              </span>
            )}
            {shadowingSubMode === 'karaoke' && (
              !karaokeActive ? (
                <Button
                  size="default"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 shadow-md"
                  onClick={() => startKaraokeSession()}
                  disabled={transcript.length === 0}
                >
                  <Mic className="w-4 h-4" /> Bắt đầu thu âm
                </Button>
              ) : (
                <Button
                  size="default"
                  variant="destructive"
                  className="gap-2 font-semibold px-5 shadow-md"
                  onClick={endKaraokeSession}
                  disabled={karaokeProcessing}
                >
                  Kết thúc và xem kết quả
                </Button>
              )
            )}
          </div>
        )}

        {/* Tiến độ từng câu: đánh giá thay đổi qua mỗi đoạn */}
        {mode === 'shadowing' && shadowingSubMode === 'normal' && transcript.length > 0 && Object.keys(sentenceScores).length > 0 && (
          <Card className="p-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Tiến độ từng câu</p>
            <div className="flex flex-wrap gap-2">
              {transcript.map((_, idx) => {
                const scoreData = sentenceScores[idx];
                const score = scoreData ? overallFromResponse(scoreData) : null;
                return (
                  <div
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      score == null
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        : score >= 80
                          ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : score >= 60
                            ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}
                    title={score != null ? `Câu ${idx + 1}: ${score} điểm` : `Câu ${idx + 1}: Chưa chấm`}
                  >
                    <span>Câu {idx + 1}</span>
                    {score != null && <span>{score}%</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {lastResponse && (
          <Card className="p-4 border border-purple-100 dark:border-gray-700 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">Kết quả chấm phát âm</h4>
                <p className="text-xs text-muted-foreground">Nghe lại và xem đánh giá</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (lastRecordedAudioUrl) URL.revokeObjectURL(lastRecordedAudioUrl);
                  setLastRecordedAudioUrl(null);
                  setLastScoredSentenceIndex(null);
                  setLastResponse(null);
                }}
              >
                Đóng
              </Button>
            </div>

            {/* Nghe lại bản ghi vừa thu */}
            {lastRecordedAudioUrl && (
              <div className="mb-4 p-3 rounded-xl bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Nghe lại bản ghi của bạn</p>
                <audio controls src={lastRecordedAudioUrl} className="w-full h-9" />
              </div>
            )}

            {/* Đánh giá tổng quan + Lưu ý */}
            {(() => {
              const d = lastResponse?.data;
              const overall = d ? overallFromResponse(d) : 0;
              const tips: string[] = [];
              if ((d?.pronunciationScore ?? 100) < 70) tips.push('Phát âm: chú ý âm cuối và trọng âm từ.');
              if ((d?.fluencyScore ?? 100) < 70) tips.push('Độ trôi chảy: nói liền mạch hơn, tránh ngắt quãng dài.');
              if ((d?.accuracyScore ?? 100) < 70) tips.push('Độ chính xác: nghe lại câu mẫu và bắt chước từng từ.');
              if (overall >= 80) tips.push('Bạn đọc rất tốt! Giữ phong độ.');
              return (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-[#4F46E5]">Điểm tổng quan: {overall}/100</span>
                    {lastScoredSentenceIndex != null && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          if (lastRecordedAudioUrl) URL.revokeObjectURL(lastRecordedAudioUrl);
                          setLastRecordedAudioUrl(null);
                          setLastResponse(null);
                          setLastScoredSentenceIndex(null);
                          startRecordingForSentence(lastScoredSentenceIndex);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Thu lại câu này
                      </Button>
                    )}
                  </div>
                  {tips.length > 0 && (
                    <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 p-2">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Lưu ý</p>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 list-disc list-inside space-y-0.5">
                        {tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Câu gốc</p>
                <p className="text-sm font-medium">{lastResponse?.data?.expectedText || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nhận diện</p>
                <p className="text-sm font-medium">{lastResponse?.data?.recognizedText || '-'}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-5">
              {[
                { label: 'Pron', value: lastResponse?.data?.pronunciationScore },
                { label: 'Acc', value: lastResponse?.data?.accuracyScore },
                { label: 'Fluency', value: lastResponse?.data?.fluencyScore },
                { label: 'Prosody', value: lastResponse?.data?.prosodyScore },
                { label: 'Complete', value: lastResponse?.data?.completenessScore },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-2 text-center">
                  <div className="text-[11px] text-muted-foreground">{item.label}</div>
                  <div className="text-lg font-semibold">
                    {typeof item.value === 'number' ? Math.round(item.value) : '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Phân tích từng từ</h5>
              <div className="flex flex-wrap gap-2">
                {(lastResponse?.data?.feedback?.Words || []).map((w: any, idx: number) => (
                  <div
                    key={`${w.Word}-${idx}`}
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getAccuracyClasses(w?.PronunciationAssessment?.AccuracyScore)}`}
                    title={`Accuracy: ${w?.PronunciationAssessment?.AccuracyScore ?? 'N/A'}`}
                  >
                    {w.Word}
                  </div>
                ))}
                {(!lastResponse?.data?.feedback?.Words || lastResponse?.data?.feedback?.Words.length === 0) && (
                  <span className="text-xs text-muted-foreground">Không có dữ liệu từ</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Chi tiết âm tiết / âm vị</h5>
              <div className="space-y-3">
                {(lastResponse?.data?.feedback?.Words || []).map((w: any, idx: number) => (
                  <div key={`${w.Word}-${idx}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{w.Word}</span>
                      <span className="text-xs text-muted-foreground">Accuracy: {w?.PronunciationAssessment?.AccuracyScore ?? '-'}</span>
                    </div>
                    {Array.isArray(w?.Syllables) && w.Syllables.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Syllables</p>
                        <div className="flex flex-wrap gap-2">
                          {w.Syllables.map((s: any, sIdx: number) => (
                            <span
                              key={`${w.Word}-s-${sIdx}`}
                              className={`px-2 py-1 rounded text-xs ${getAccuracyClasses(s?.PronunciationAssessment?.AccuracyScore)}`}
                            >
                              {s.Syllable} ({s?.PronunciationAssessment?.AccuracyScore ?? '-'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(w?.Phonemes) && w.Phonemes.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phonemes</p>
                        <div className="flex flex-wrap gap-2">
                          {w.Phonemes.map((p: any, pIdx: number) => (
                            <span
                              key={`${w.Word}-p-${pIdx}`}
                              className={`px-2 py-1 rounded text-xs ${getAccuracyClasses(p?.PronunciationAssessment?.AccuracyScore)}`}
                            >
                              {p.Phoneme} ({p?.PronunciationAssessment?.AccuracyScore ?? '-'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── Kết quả Karaoke: tổng hợp gọn gàng + gợi ý cải thiện ── */}
        {karaokeSummaryVisible && Object.keys(karaokeResults).length > 0 && (() => {
          const allResults = Object.values(karaokeResults);
          const successful = allResults.filter((d) => d.status !== 'FAILED' && !d.errorMessage && overallFromResponse(d) > 0);
          const overallAvg = successful.length
            ? Math.round(successful.reduce((s, d) => s + overallFromResponse(d), 0) / successful.length)
            : 0;
          const fluencyAvg = successful.length
            ? Math.round(
                successful.reduce((s, d) => s + (d.fluencyScore ?? 0), 0) / successful.length
              )
            : 0;
          const pronAvg = successful.length
            ? Math.round(
                successful.reduce((s, d) => s + (d.pronunciationScore ?? 0), 0) / successful.length
              )
            : 0;

          // Mặc định chỉ hiển thị câu lỗi hoặc điểm < 90; nếu không có thì hiển thị tất cả
          const entries = Object.entries(karaokeResults).sort(
            ([a], [b]) => Number(a) - Number(b)
          );
          const problematic = entries.filter(([, d]) => {
            const isFailed = d.status === 'FAILED' || d.errorMessage;
            const overall = overallFromResponse(d);
            return isFailed || overall < 90;
          });
          const displayEntries = problematic.length > 0 ? problematic : entries;

          return (
            <Card className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-3 gap-3">
                <div>
                  <h4 className="font-semibold text-base">Kết quả Karaoke</h4>
                  <p className="text-xs text-muted-foreground">
                    Tổng quan hiệu suất của bạn trong lượt này
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setKaraokeSummaryVisible(false)}>Đóng</Button>
              </div>

              {/* Summary header dạng dashboard nhỏ */}
              <div className="mb-3 grid grid-cols-3 gap-2 text-xs sm:text-sm">
                <div className="rounded-xl bg-slate-900 text-white px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">Tổng điểm</span>
                  <span className="font-semibold text-[15px]">
                    {overallAvg}
                    <span className="text-[11px] ml-1 opacity-80">/100</span>
                  </span>
                </div>
                <div className="rounded-xl bg-sky-900/80 text-sky-50 px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-sky-300">Độ trôi chảy</span>
                  <span className="font-semibold text-[15px]">
                    {fluencyAvg}
                    <span className="text-[11px] ml-1 opacity-80">%</span>
                  </span>
                </div>
                <div className="rounded-xl bg-emerald-900/80 text-emerald-50 px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-emerald-300">Phát âm</span>
                  <span className="font-semibold text-[15px]">
                    {pronAvg}
                    <span className="text-[11px] ml-1 opacity-80">%</span>
                  </span>
                </div>
              </div>

              {karaokeProcessing ? (
                <div className="flex items-center gap-3 py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Đang chấm điểm từng câu...</span>
                </div>
              ) : (
                <>
                  {/* Danh sách câu – giới hạn chiều cao + scroll, hiển thị dạng grid 2 cột trên màn lớn */}
                  <div className="max-h-72 overflow-y-auto pr-1">
                    <div className="grid gap-2 md:grid-cols-2">
                      {displayEntries.map(([idxStr, data]) => {
                        const idx = Number(idxStr);
                        const line = transcript[idx];
                        const isFailed = data.status === 'FAILED' || data.errorMessage;
                        const overall = overallFromResponse(data);
                        const weakWords = (data?.feedback?.Words || []).filter(
                          (w: any) => (w?.PronunciationAssessment?.AccuracyScore ?? 100) < 70
                        );
                        const scoreColor =
                          overall >= 90
                            ? 'bg-teal-500 text-white'
                            : overall >= 50
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-pink-500 text-white';

                        return (
                          <div
                            key={idx}
                            className={`rounded-xl p-3 border bg-white dark:bg-slate-950/60 ${
                              isFailed ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Câu {idx + 1}</span>
                              {isFailed ? (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                  Không chấm được
                                </span>
                              ) : (
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${scoreColor}`}>
                                  {overall} điểm
                                </span>
                              )}
                            </div>
                            {line && (
                              <p className="text-xs mt-1 text-foreground/90 line-clamp-2" title={line.text}>
                                {line.text}
                              </p>
                            )}
                            {isFailed && data.errorMessage && (
                              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 line-clamp-3" title={data.errorMessage}>
                                {data.errorMessage}
                              </p>
                            )}
                            {!isFailed && data.recognizedText && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-2" title={data.recognizedText}>
                                Bạn nói: {data.recognizedText}
                              </p>
                            )}
                            {!isFailed && weakWords.length > 0 && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                                Cần luyện thêm: {weakWords.map((w: any) => w.Word).join(', ')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gợi ý thu gọn dưới dạng "bóng đèn" */}
                  <details className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm">
                    <summary className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-amber-500">💡</span>
                      <span className="font-semibold text-amber-800 dark:text-amber-200">Gợi ý cải thiện</span>
                    </summary>
                    <ul className="mt-2 text-xs text-amber-800 dark:text-amber-200/90 space-y-1 list-disc list-inside">
                      {Object.values(karaokeResults).some((d) => d.status === 'FAILED' || d.errorMessage) && (
                        <li>Một số câu bị timeout hoặc không nhận diện được: thử nói rõ hơn, gần micro, hoặc thu lại đoạn đó.</li>
                      )}
                      {Object.values(karaokeResults).some((d) => d.status !== 'FAILED' && overallFromResponse(d) < 70) && (
                        <li>Luyện phát âm những câu dưới 70 điểm — nghe lại video và nói chậm, rõ từng từ.</li>
                      )}
                      {Object.values(karaokeResults).some((d) => d.status !== 'FAILED' && (d.fluencyScore ?? 0) < 70) && (
                        <li>Độ trôi chảy: nói liền mạch hơn, tránh ngắt quãng dài giữa các từ.</li>
                      )}
                      {Object.values(karaokeResults).some((d) => d.status !== 'FAILED' && (d.pronunciationScore ?? 0) < 70) && (
                        <li>Phát âm: chú ý âm cuối (ending sounds) và trọng âm từ.</li>
                      )}
                      <li>Thử lại chế độ Karaoke với tốc độ video 0.75x để bắt kịp nhịp nói.</li>
                    </ul>
                  </details>
                </>
              )}
            </Card>
          );
        })()}

        {/* ── Main Grid ── */}
        <div className={`grid gap-4 ${showScript && transcript.length > 0 ? 'lg:grid-cols-5' : ''} ${mode === 'shadowing' && !showVideoInShadowing ? 'lg:grid-cols-1' : ''}`}>

          {/* Video — ẩn trong shadowing nếu user chọn ẩn video */}
          {(mode !== 'shadowing' || showVideoInShadowing) && (
          <div className={showScript && transcript.length > 0 ? 'lg:col-span-3' : ''}>
            <Card className="overflow-hidden rounded-2xl border shadow-lg bg-card">
              <div className="bg-black relative" style={{ aspectRatio: '16/9' }}>

                {ytVideoId ? (
                  <div id="yt-player" className="w-full h-full" />
                ) : hasNativeVideo ? (
                  <video
                    key={videoSrcForPlayer}
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    {...(isS3VideoUrl ? {} : { crossOrigin: 'anonymous' as const })}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={e => setDuration(e.currentTarget.duration * 1000)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => toast.error('Không tải được video. Kiểm tra link hoặc kết nối.')}
                  >
                    <source src={videoSrcForPlayer} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-3">
                    <Play className="w-16 h-16 opacity-20" />
                    <p className="text-sm text-center px-8">Chưa có video. Admin cần thêm URL YouTube hoặc link video.</p>
                  </div>
                )}

                {/* Subtitle overlay */}
                {showOverlaySub && currentLine && (
                  <div className="absolute bottom-14 left-0 right-0 px-6 pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-sm rounded-xl p-3 text-center mx-auto max-w-2xl">
                      {/* English */}
                      {showWordIPA && currentLine.ipa ? (
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                          {buildWordIpaPairs(currentLine.text, currentLine.ipa).map((wp, i) => (
                            <button
                              key={i}
                              type="button"
                              className="inline-flex flex-col items-center px-0.5 focus:outline-none focus-visible:outline-none pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWordClick(wp.word, wp.ipa, currentLine.viText, {
                                  text: currentLine.text,
                                  viText: currentLine.viText,
                                });
                              }}
                            >
                              <span className="text-white text-base font-medium leading-tight">{wp.word}</span>
                              {wp.ipa && <span className="text-green-300 text-xs leading-tight">{wp.ipa}</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white text-lg font-medium">{currentLine.text}</p>
                      )}
                      {/* IPA câu */}
                      {showIPA && currentLine.ipa && !showWordIPA && (
                        <p className="text-green-300 text-sm font-mono mt-1">{currentLine.ipa}</p>
                      )}
                      {/* Dịch */}
                      {showVI && currentLine.viText && (
                        <p className="text-yellow-300 text-sm mt-1">{currentLine.viText}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Native video controls */}
                {!ytVideoId && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    {/* seekbar */}
                    <div
                      className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group"
                      onClick={e => {
                        if (!videoRef.current || !duration) return;
                        const r = e.currentTarget.getBoundingClientRect();
                        videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * (duration / 1000);
                      }}
                    >
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${duration ? (currentMs / duration) * 100 : 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); setIsPlaying(true); } }} className="text-white hover:bg-white/20 h-7 w-7">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20 h-7 w-7">
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <span className="text-white text-xs tabular-nums">{formatTime(currentMs)} / {formatTime(duration)}</span>
                        {/* Tốc độ phát */}
                        <div className="flex items-center gap-0.5 ml-1">
                          {[0.75, 1, 1.25].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setPlaybackRateVideo(r)}
                              className={`min-w-[2rem] py-0.5 px-1.5 rounded text-[11px] font-medium transition-colors ${
                                playbackRate === r ? 'bg-white text-black' : 'text-white/80 hover:bg-white/20'
                              }`}
                            >
                              {r}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube toolbar: play, mute, tốc độ */}
              {ytVideoId && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs border-t bg-muted/80">
                  <Button size="icon" variant="ghost" onClick={togglePlay} className="h-6 w-6">
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={toggleMute} className="h-6 w-6">
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>
                  <span className="text-muted-foreground tabular-nums">{formatTime(currentMs)}</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    {[0.75, 1, 1.25].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setPlaybackRateVideo(r)}
                        className={`min-w-[2rem] py-0.5 px-1 rounded text-[11px] font-medium ${
                          playbackRate === r ? 'bg-[#4F46E5] text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
          )}

          {/* ── Script Panel ── */}
          {showScript && transcript.length > 0 && (
            <div className="lg:col-span-2">
              <Card className="flex flex-col h-full rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="p-3 border-b bg-muted/30 flex items-center gap-2 flex-shrink-0">
                  <AlignLeft className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Script</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{transcript.length} câu</span>
                </div>

                <div ref={scriptRef} className="flex-1 overflow-y-auto divide-y divide-border" style={{ maxHeight: '480px' }}>
                  {transcript.map((line, idx) => {
                    const isActive = idx === activeLineIdx;
                    const pairs = (showWordIPA && line.ipa)
                      ? buildWordIpaPairs(line.text, line.ipa)
                      : null;
                    const score = sentenceScores[idx];
                    const isRecordingThis = recordingForSentenceIndex === idx;
                    const isScoringThis = scoringSentenceIndex === idx;

                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLineRef : undefined}
                        onClick={mode !== 'shadowing' ? () => seekToLine(line) : undefined}
                        className={`px-4 py-3 group transition-colors rounded-lg mx-1 my-0.5 ${
                          mode === 'shadowing' ? '' : 'cursor-pointer'
                        } ${
                          isActive && mode !== 'shadowing'
                            ? 'border-l-4 border-l-[#4F46E5] bg-[#EEF2FF] dark:bg-indigo-950/40'
                            : mode === 'shadowing' && score
                              ? getScoreBg(overallFromResponse(score))
                              : 'hover:bg-muted/40'
                        } ${isScoringThis ? 'ring-2 ring-primary/30' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Timestamp */}
                          <span className="text-xs text-muted-foreground mt-0.5 flex-shrink-0 w-9 tabular-nums">
                            {formatTime(line.start)}
                          </span>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* English — word IPA or plain */}
                            {pairs ? (
                              <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                                {pairs.map((wp, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="inline-flex flex-col items-center px-0.5 text-left focus:outline-none focus-visible:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWordClick(wp.word, wp.ipa, line.viText, {
                                        text: line.text,
                                        viText: line.viText,
                                      });
                                    }}
                                  >
                                    <span className={`text-sm leading-tight ${isActive && mode !== 'shadowing' ? 'font-semibold text-primary' : 'text-foreground'}`}>
                                      {wp.word}
                                    </span>
                                    {wp.ipa && (
                                      <span className="text-xs text-purple-500 dark:text-purple-400 leading-tight font-mono">
                                        {wp.ipa}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm leading-snug ${isActive && mode !== 'shadowing' ? 'font-semibold text-primary' : 'text-foreground'}`}>
                                {line.text}
                              </p>
                            )}

                            {/* IPA câu (khi không dùng word IPA) */}
                            {showIPA && !showWordIPA && line.ipa && (
                              <p className="text-xs text-green-600 dark:text-green-400 font-mono leading-tight">
                                /{line.ipa}/
                              </p>
                            )}

                            {/* Dịch tiếng Việt */}
                            {showVI && line.viText && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-tight italic">
                                {line.viText}
                              </p>
                            )}

                            {/* Ngữ pháp: Accordion — chỉ hiện nội dung khi mở ── */}
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGrammarExplain(idx, line.text);
                                }}
                                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              >
                                <BookOpen className="w-3 h-3" />
                                Ngữ pháp
                                {grammarExplainIdx === idx ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                              {grammarExplainIdx === idx && grammarExplainText && (
                                <div className="mt-1.5 rounded-lg px-3 py-2 text-[11px] text-foreground/90 whitespace-pre-line border border-amber-200/80 dark:border-amber-800/60 bg-[#FFFBEB] dark:bg-amber-950/30">
                                  {grammarExplainText}
                                </div>
                              )}
                            </div>

                            {/* Thoại theo: Thu âm bình thường (từng câu, chấm ngay) hoặc Karaoke (trạng thái theo video) */}
                            {mode === 'shadowing' && (
                              <div className="mt-3 pt-2 border-t border-border/60 space-y-2">
                                {shadowingSubMode === 'karaoke' ? (
                                  <>
                                    {karaokeActive && karaokeRecordingSentence === idx && (
                                      <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-medium">Đang thu...</span>
                                      </div>
                                    )}
                                    {karaokeRecordedBlobs[idx] && !karaokeActive && (
                                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Đã thu</span>
                                    )}
                                    {karaokeResults[idx] && (() => {
                                      const res = karaokeResults[idx];
                                      const isFailed = res.status === 'FAILED' || res.errorMessage;
                                      return isFailed ? (
                                        <div className="rounded-lg p-2.5 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                          <span className="font-bold text-red-600 dark:text-red-400">Không chấm được</span>
                                          {res.errorMessage && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate" title={res.errorMessage}>
                                              {res.errorMessage}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className={`rounded-lg p-2.5 text-sm ${getScoreBg(overallFromResponse(karaokeResults[idx]))}`}>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`font-bold ${getScoreColor(overallFromResponse(karaokeResults[idx]))}`}>
                                              {overallFromResponse(karaokeResults[idx])} điểm
                                            </span>
                                            <span>Phát âm {(karaokeResults[idx].pronunciationScore ?? 0).toFixed(0)}%</span>
                                            <span>·</span>
                                            <span>Độ chính xác {(karaokeResults[idx].accuracyScore ?? 0).toFixed(0)}%</span>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  <>
                                    {isScoringThis ? (
                                      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-primary/10 text-primary">
                                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                        <span className="text-sm font-medium">Đang chấm điểm...</span>
                                      </div>
                                    ) : isRecordingThis ? (
                                      <div className="flex flex-col items-center py-2">
                                        <RecordingButton
                                          isRecording={isRecording}
                                          recordingTime={recordingTime}
                                          maxDuration={60}
                                          onStartRecording={() => {}}
                                          onStopRecording={stopRecordingForSentence}
                                          size="sm"
                                          showWaveform={false}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Nhấn nút để dừng thu âm</p>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 h-9 min-w-[7rem]"
                                        onClick={(e) => { e.stopPropagation(); startRecordingForSentence(idx); }}
                                      >
                                        <Mic className="w-4 h-4" /> Thu âm
                                      </Button>
                                    )}
                                    {score && !isScoringThis && (
                                      <div className={`rounded-lg p-2.5 text-sm ${getScoreBg(overallFromResponse(score))}`}>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`font-bold ${getScoreColor(overallFromResponse(score))}`}>
                                            {overallFromResponse(score)} điểm
                                          </span>
                                          <span className="text-muted-foreground">·</span>
                                          <span>Phát âm {(score.pronunciationScore ?? 0).toFixed(0)}%</span>
                                          <span>·</span>
                                          <span>Độ chính xác {(score.accuracyScore ?? 0).toFixed(0)}%</span>
                                          <span>·</span>
                                          <span>Độ trôi chảy {(score.fluencyScore ?? 0).toFixed(0)}%</span>
                                        </div>
                                        {score.recognizedText && (
                                          <p className="text-xs text-muted-foreground mt-1 truncate" title={score.recognizedText}>
                                            Bạn nói: {score.recognizedText}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {mode !== 'shadowing' && (
                          <ChevronRight className={`w-3 h-3 flex-shrink-0 mt-1 transition-opacity ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-60 text-muted-foreground'}`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Word info panel + Lưu từ vựng */}
                {selectedWord && (
                  <div className="border-t px-3 py-2.5 text-xs flex items-start gap-3 bg-[#F8F9FB] dark:bg-gray-900/50">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#EEF2FF', color: ACTIVE_COLOR }}>
                      {selectedWord.text.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{selectedWord.text}</span>
                        {selectedWord.ipa && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            /{selectedWord.ipa}/
                          </span>
                        )}
                      </div>
                      {wordLoading ? (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang tra cứu từ vựng...
                        </p>
                      ) : (
                        selectedWord.meaning && (
                          <p className="text-[11px] text-muted-foreground">
                            Nghĩa: <span className="text-foreground">{selectedWord.meaning}</span>
                          </p>
                        )
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-[11px] mt-1"
                        disabled={savedWordId === selectedWord.text.toLowerCase()}
                        onClick={async () => {
                          const key = selectedWord.text.toLowerCase();
                          if (savedWordId === key) return;
                          try {
                            const exampleParts = [
                              selectedWord.sentenceText,
                              selectedWord.sentenceViText,
                            ].filter(Boolean);
                            const example =
                              exampleParts.length > 0 ? exampleParts.join(' — ') : undefined;
                            const res = await apiService.student.myVocabulary.add({
                              word: selectedWord.text,
                              phonetic: selectedWord.ipa,
                              meaning: selectedWord.meaning,
                              example,
                              lessonId: lessonId ?? undefined,
                            });
                            setSavedWordId(key);
                            const msg = res.data?.data?.alreadySaved
                              ? `"${selectedWord.text}" đã có trong bộ sưu tập.`
                              : `Đã lưu "${selectedWord.text}" vào bộ sưu tập từ vựng.`;
                            toast.success(msg);
                          } catch (e: any) {
                            toast.error(e?.response?.data?.message ?? 'Không thể lưu từ vựng. Thử lại sau.');
                          }
                        }}
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        {savedWordId === selectedWord.text.toLowerCase() ? 'Đã lưu' : 'Lưu từ vựng'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* ── CTA: Sau khi xem, chọn Thoại theo hoặc Bỏ qua ── */}
        {mode === 'watch' && transcript.length > 0 && (
          <Card className="p-4 rounded-2xl border border-primary/10 bg-primary/5 mt-2 lg:mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-foreground/90">
                Bạn đã xem qua nội dung. <strong>Thoại theo</strong> từng câu để được chấm phát âm ngay và cải thiện.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setMode('shadowing')}
                  className="gap-2 bg-gradient-to-r from-[#8E2DE2] via-[#6A11CB] to-[#4A00E0] hover:brightness-110 text-white shadow-lg shadow-purple-400/40"
                >
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-pink-500 flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </span>
                  </span>
                  <span>Bắt đầu thoại theo</span>
                </Button>
                <Button variant="outline" onClick={handleComplete} className="gap-2">
                  Bỏ qua, hoàn thành bài học
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Processing banner */}
        {transcript.length === 0 && lesson?.s3Status === 'PROCESSING' && (
          <Card className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Đang phân tích video...</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Đang tạo subtitle, dịch tiếng Việt và IPA. Trang tự cập nhật khi xong.
              </p>
            </div>
          </Card>
        )}

        {/* Complete */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6 rounded-xl shadow-md">
            <CheckCircle2 className="w-5 h-5" /> Hoàn thành bài học
          </Button>
        </div>
      </div>

      {/* Floating action button: luôn hiển thị trên góc phải khi đã có transcript và chưa vào shadowing */}
      {mode === 'watch' && transcript.length > 0 && (
        <button
          type="button"
          onClick={() => setMode('shadowing')}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-gradient-to-r from-[#8E2DE2] via-[#6A11CB] to-[#4A00E0] text-white shadow-xl shadow-purple-500/40 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-400"
        >
          <span className="relative flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </span>
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Thoại theo ngay</span>
        </button>
      )}
    </div>
  );
}
