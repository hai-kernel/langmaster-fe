import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Mic, Volume2, RotateCcw, CheckCircle2, Square, ArrowLeft, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface PhraseItem {
  id: number;
  word: string;
  phonetic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const FALLBACK_PHRASES: PhraseItem[] = [
  { id: 1, word: 'Restaurant', phonetic: '/ˈrestərɑːnt/', difficulty: 'medium' },
  { id: 2, word: 'Pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', difficulty: 'hard' },
  { id: 3, word: 'Beautiful', phonetic: '/ˈbjuːtɪfl/', difficulty: 'easy' },
];

function overallScore(d: { pronunciationScore?: number; accuracyScore?: number; fluencyScore?: number; prosodyScore?: number; completenessScore?: number } | null): number {
  if (!d) return 0;
  const p = d.pronunciationScore ?? 0;
  const a = d.accuracyScore ?? 0;
  const f = d.fluencyScore ?? 0;
  const pr = d.prosodyScore ?? 0;
  const c = d.completenessScore ?? 0;
  const arr = [p, a, f, pr, c].filter((x) => x != null && !Number.isNaN(x));
  return arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0;
}

export function PronunciationLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [phrases, setPhrases] = useState<PhraseItem[]>(FALLBACK_PHRASES);
  const [phrasesLoading, setPhrasesLoading] = useState(!!lessonId);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const currentPhrase = phrases[currentWordIndex];
  const progress = phrases.length > 0 ? ((currentWordIndex + 1) / phrases.length) * 100 : 0;

  useEffect(() => {
    if (!lessonId) { setPhrasesLoading(false); return; }
    setPhrasesLoading(true);
    apiService.transcribe.getTranscript(Number(lessonId))
      .then((res) => {
        const data = res.data?.data;
        if (data && Array.isArray(data) && data.length > 0) {
          const items: PhraseItem[] = data.map((s: any, i: number) => ({
            id: i + 1,
            word: typeof s.text === 'string' ? s.text.trim() : String(s.text || '').trim(),
            phonetic: s.ipa || '',
            difficulty: 'medium' as const,
          })).filter((p) => p.word.length > 0);
          if (items.length > 0) setPhrases(items);
        }
      })
      .catch(() => setPhrases(FALLBACK_PHRASES))
      .finally(() => setPhrasesLoading(false));
  }, [lessonId]);

  const playAudio = useCallback(() => {
    if (!currentPhrase) return;
    const u = new SpeechSynthesisUtterance(currentPhrase.word);
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }, [currentPhrase]);

  const startRecording = useCallback(async () => {
    if (!currentPhrase || !lessonId) return;
    setIsRecording(true);
    setAttempts((a) => a + 1);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const preferredMimeTypes = [
        'audio/mp4',
        'audio/m4a',
        'audio/aac',
        'audio/webm;codecs=opus',
        'audio/webm',
      ];
      const selectedMimeType = preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const mr = selectedMimeType ? new MediaRecorder(stream, { mimeType: selectedMimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        if (chunksRef.current.length === 0) {
          toast.error('Không có bản ghi âm. Hãy nói rồi nhấn Dừng.');
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/mp4' });
        const ext = mr.mimeType?.includes('mp4') || mr.mimeType?.includes('m4a') ? '.m4a'
          : mr.mimeType?.includes('aac') ? '.aac'
          : mr.mimeType?.includes('wav') ? '.wav'
          : '.webm';
        const file = new File([blob], `recording${ext}`, { type: blob.type || 'audio/mp4' });
        setSelectedFile(file);
        toast.success('Đã lưu bản ghi âm. Hãy bấm "Chấm phát âm từ file".');
      };
      mr.start(200);
    } catch {
      toast.error('Không thể truy cập micro.');
      setIsRecording(false);
    }
  }, [lessonId, currentPhrase, currentWordIndex]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleNext = () => {
    if (currentWordIndex < phrases.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setAttempts(0);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setAttempts(0);
    }
  };


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const canComplete = phrases.length > 0 && phrases.every((_, i) => (scores[i] ?? 0) >= 70);
  const fileReady = !!selectedFile && selectedFile.size > 0;

  if (phrasesLoading || !currentPhrase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold">Attempts: {attempts}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{currentWordIndex + 1} / {phrases.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Main Card */}
        <Card className="p-8">
          <div className="text-center space-y-6">
            {/* Difficulty Badge */}
            <Badge className={getDifficultyColor(currentPhrase.difficulty)}>
              {currentPhrase.difficulty.toUpperCase()}
            </Badge>

            {/* Word Display */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                {currentPhrase.word}
              </h1>
              <p className="text-2xl text-gray-600 dark:text-gray-400">
                {currentPhrase.phonetic}
              </p>
            </div>

            {/* Listen Button */}
            <Button
              type="button"
              onClick={playAudio}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Volume2 className="w-5 h-5" />
              Listen
            </Button>

            {/* Recording Section */}
            <div className="py-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="audio/m4a,audio/mp4,audio/aac"
                    className="block w-full max-w-xs text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-700"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file) {
                        console.info('Pronunciation file selected:', {
                          name: file.name,
                          type: file.type,
                          size: file.size,
                        });
                      }
                    }}
                  />
                  {selectedFile && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tải lên file .m4a/.mp4 để chấm phát âm (giống Swagger)
                </p>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Đang phân tích phát âm...</p>
                </div>
              ) : isRecording ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-red-600">Đang thu âm...</p>
                  <Button type="button" onClick={stopRecording} variant="outline" className="gap-2 border-red-300 text-red-700">
                    <Square className="w-4 h-4" /> Dừng
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={startRecording}
                  size="lg"
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Mic className="w-12 h-12" />
                </Button>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Nhấn micro để thu âm, nói xong nhấn Dừng
              </p>

              {selectedFile && !isAnalyzing && (
                <Button
                  type="button"
                  disabled={!fileReady}
                  onClick={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!lessonId || !currentPhrase) return;
                    if (!fileReady) {
                      toast.error('File không hợp lệ. Vui lòng chọn lại.');
                      return;
                    }
                    console.info('Pronunciation upload payload:', {
                      name: selectedFile.name,
                      type: selectedFile.type,
                      size: selectedFile.size,
                      lessonId,
                      sentenceIndex: currentWordIndex,
                    });
                    setIsAnalyzing(true);
                    setLastResponse(null);
                    try {
                      const res = await apiService.pronunciation.getScore(
                        Number(lessonId),
                        currentWordIndex,
                        selectedFile,
                        currentPhrase.word
                      );
                      const d = res.data?.data;
                      if (d) {
                        setLastResponse(res.data);
                        const score = overallScore(d);
                        setScores((prev) => {
                          const next = [...prev];
                          next[currentWordIndex] = Math.max(score, next[currentWordIndex] ?? 0);
                          return next;
                        });
                        if (score >= 85) toast.success(`Xuất sắc! ${score}/100 🎉`);
                        else if (score >= 70) toast.success(`Tốt! ${score}/100.`);
                        else toast.info(`${score}/100. Nghe mẫu và thử lại.`);
                      } else toast.error('Không nhận được kết quả chấm điểm.');
                    } catch (err: any) {
                      setLastResponse(err?.response?.data ?? null);
                      toast.error(err?.response?.data?.message || 'Chấm phát âm thất bại. Thử lại.');
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  className="w-full max-w-xs"
                >
                  Chấm phát âm từ file
                </Button>
              )}

              {lastResponse && (
                <Card className="p-4 border border-purple-100 dark:border-gray-700 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Response chi tiết</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLastResponse(null)}
                    >
                      Đóng
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words max-h-80 overflow-auto">
                    {JSON.stringify(lastResponse, null, 2)}
                  </pre>
                </Card>
              )}
            </div>

            {/* Score Display */}
            {scores[currentWordIndex] !== undefined && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your Best Score
                </p>
                <div className="flex items-center justify-center gap-3">
                  {scores[currentWordIndex] >= 85 ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <RotateCcw className="w-8 h-8 text-yellow-600" />
                  )}
                  <p className={`text-5xl font-bold ${getScoreColor(scores[currentWordIndex])}`}>
                    {scores[currentWordIndex]}
                    <span className="text-2xl">/100</span>
                  </p>
                </div>
                {scores[currentWordIndex] < 85 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Try again to improve your score!
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentWordIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={scores[currentWordIndex] == null || scores[currentWordIndex] < 70}
            className="gap-2"
          >
            Tiếp theo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Score Overview */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            {phrases.map((phrase, idx) => (
              <div
                key={phrase.id}
                className={`p-4 rounded-lg border-2 ${
                  idx === currentWordIndex
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : scores[idx] != null
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm font-semibold mb-1 truncate">{phrase.word}</p>
                {scores[idx] != null ? (
                  <p className={`text-2xl font-bold ${getScoreColor(scores[idx])}`}>
                    {scores[idx]}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Chưa thử</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}