import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Flag,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { RecordingButton } from '@/shared/ui/RecordingButton';
import { ConfettiCelebration } from '@/shared/ui/ConfettiCelebration';
import apiService from '@/services/apiService';

interface OptionTake {
  id: number;
  content: string;
}

interface QuestionTake {
  id: number;
  content: string;
  type: string;
  points: number;
  orderIndex?: number;
  options?: OptionTake[];
}

interface TestTakeData {
  id: number;
  title: string;
  durationMinutes: number | null;
  passScore: number | null;
  totalPoints: number;
  questions: QuestionTake[];
}

interface AttemptResult {
  totalScore: number;
  totalPoints: number;
  passScore: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
}

export function TestTaking() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestTakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;
    setLoading(true);
    apiService.test
      .getForTaking(Number(testId))
      .then((res) => {
        if (cancelled || !res.data?.data) return;
        const d = res.data.data as any;
        setTestData({
          id: d.id,
          title: d.title,
          durationMinutes: d.durationMinutes ?? null,
          passScore: d.passScore ?? 70,
          totalPoints: d.totalPoints ?? 0,
          questions: Array.isArray(d.questions) ? d.questions : [],
        });
        const durationSec = (d.durationMinutes ?? 30) * 60;
        setTimeRemaining(durationSec);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Không tải được bài test');
          navigate('/tests');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [testId, navigate]);

  const testQuestions = testData?.questions ?? [];
  const currentQuestion = testQuestions[currentQuestionIndex];
  const totalQuestions = testQuestions.length;
  const progress = totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (!hasStarted || !testData) return;
    const durationSec = (testData.durationMinutes ?? 30) * 60;
    setTimeRemaining(durationSec);
  }, [hasStarted, testData?.id]);

  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          toast.warning('Hết thời gian! Đang nộp bài...');
          handleSubmitSilent();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const buildAnswersPayload = () =>
    Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId: Number(questionId),
      userAnswer: String(userAnswer ?? ''),
    }));

  const handleSubmitSilent = async () => {
    if (!testId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiService.test.submitAttempt(Number(testId), {
        answers: buildAnswersPayload(),
      });
      const data = res.data?.data as any;
      if (data) {
        setResult({
          totalScore: data.totalScore ?? 0,
          totalPoints: data.totalPoints ?? 0,
          passScore: data.passScore ?? 70,
          passed: !!data.passed,
          correctCount: data.correctCount ?? 0,
          totalQuestions: data.totalQuestions ?? 0,
        });
      }
      setShowResults(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Nộp bài thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const unansweredCount = totalQuestions - Object.keys(answers).length;
    if (unansweredCount > 0 && !window.confirm(
      `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
    )) return;
    setShowExitConfirm(false);
    await handleSubmitSilent();
  };

  const typeLabel: Record<string, string> = {
    MCQ: 'Trắc nghiệm',
    FILL_BLANK: 'Điền từ',
    SPEAKING: 'Nói',
  };

  if (loading || !testData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      </div>
    );
  }

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Bài test chưa có câu hỏi.</p>
          <Button onClick={() => navigate('/tests')}>Quay lại danh sách</Button>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 flex items-center justify-center">
        <motion.div className="max-w-2xl w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <Flag className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{testData.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Chuẩn bị sẵn sàng cho bài kiểm tra</p>
            </div>
            <div className="space-y-4 mb-8">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      Thời gian: {testData.durationMinutes ?? '—'} phút
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Bài test sẽ tự động nộp khi hết giờ</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Số câu hỏi: {testQuestions.length}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Bạn có thể quay lại câu trước đã làm</div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Lưu ý quan trọng
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li>• Đảm bảo kết nối internet ổn định</li>
                <li>• Không thoát khỏi trang trong khi làm bài</li>
                <li>• Điểm đạt: {testData.passScore ?? 70}%</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="lg" onClick={() => navigate('/tests')}>Quay lại</Button>
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white gap-2" onClick={() => setHasStarted(true)}>
                <Check className="h-5 w-5" /> Bắt đầu làm bài
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showResults && result) {
    const passed = result.passed;
    const pct = result.totalPoints > 0 ? Math.round((result.totalScore / result.totalPoints) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        {passed && <ConfettiCelebration />}
        <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mb-6">
              <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                {passed ? <Check className="h-12 w-12 text-green-600 dark:text-green-400" /> : <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />}
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">{passed ? 'Chúc mừng! Bạn đã đạt!' : 'Cần cải thiện!'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {passed ? 'Bạn đã hoàn thành xuất sắc bài kiểm tra này!' : 'Đừng nản lòng, hãy ôn tập và thử lại nhé!'}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pct}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Điểm số</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {result.correctCount}/{result.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Câu đúng</div>
              </Card>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/tests')}>Về danh sách test</Button>
              {!passed && (
                <Button className="bg-green-500 hover:bg-green-600" onClick={() => window.location.reload()}>Làm lại</Button>
              )}
              {passed && (
                <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate('/tests')}>Xem kết quả chi tiết</Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeRemaining)}
              </Badge>
              <Badge>Câu {currentQuestionIndex + 1}/{totalQuestions}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)}>
              <Flag className="h-4 w-4 mr-2" /> Nộp bài
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 mb-6">
              <div className="mb-4">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {typeLabel[currentQuestion?.type ?? ''] ?? currentQuestion?.type}
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-6">{currentQuestion?.content}</h2>

              {(currentQuestion?.type === 'MCQ' || currentQuestion?.type === 'FILL_BLANK') && currentQuestion?.options && currentQuestion.options.length > 0 && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isMcq = currentQuestion.type === 'MCQ';
                    const value = isMcq ? String(opt.id) : opt.content;
                    const isSelected = answers[currentQuestion.id] === value;
                    return (
                    <motion.div key={opt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleAnswer(value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <Check className="h-5 w-5" />}
                          </div>
                          <span className="text-lg">{opt.content}</span>
                        </div>
                      </Card>
                    </motion.div>
                    );
                  })}
                </div>
              )}

              {currentQuestion?.type === 'FILL_BLANK' && (!currentQuestion.options || currentQuestion.options.length === 0) && (
                <Input
                  placeholder="Nhập đáp án..."
                  value={answers[currentQuestion.id] ?? ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="max-w-md"
                />
              )}

              {currentQuestion?.type === 'SPEAKING' && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-gray-600 dark:text-gray-400">Nhấn nút để ghi âm (tối đa 30 giây)</p>
                  <RecordingButton
                    onRecordingComplete={() => {
                      handleAnswer('recorded');
                      toast.success('Đã lưu bản ghi âm!');
                    }}
                    maxDuration={30}
                  />
                  {answers[currentQuestion.id] && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" /> Đã ghi âm
                    </Badge>
                  )}
                </div>
              )}
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Câu trước
              </Button>
              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button onClick={() => setShowExitConfirm(true)} className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'} <Check className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600">
                  Câu sau <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <Card className="mt-6 p-4">
          <h3 className="font-semibold mb-3">Tổng quan câu trả lời</h3>
          <div className="flex flex-wrap gap-2">
            {testQuestions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-10 w-10 rounded-lg font-semibold transition-all ${
                  answers[q.id] !== undefined ? 'bg-green-500 text-white'
                    : currentQuestionIndex === index ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bạn đã trả lời {Object.keys(answers).length}/{totalQuestions} câu. Bạn có chắc muốn nộp bài?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowExitConfirm(false)}>Tiếp tục làm bài</Button>
                <Button className="bg-green-500 hover:bg-green-600" onClick={handleSubmit}>Nộp bài</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
