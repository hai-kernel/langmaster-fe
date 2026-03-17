import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Mic,
  Volume2,
  ChevronLeft,
  RotateCcw,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import type { PronunciationResult } from '@/types';

interface AIResultsProps {
  result: PronunciationResult;
  onRetry?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
}

export function AIResults({ result, onRetry, onContinue, onBack }: AIResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 75) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 75) return 'Tốt! 👍';
    return 'Cần cải thiện 💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        {onBack && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Kết quả đánh giá</h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI đã phân tích phát âm của bạn
            </p>
          </div>

          {/* Overall Score */}
          <Card className={`p-6 ${getScoreBg(result.score.overall)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Điểm tổng quan</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getScoreLabel(result.score.overall)}
                </p>
              </div>
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className={`text-5xl font-bold ${getScoreColor(result.score.overall)}`}
                >
                  {result.score.overall}
                </motion.div>
                <Trophy className={`h-8 w-8 mx-auto mt-2 ${getScoreColor(result.score.overall)}`} />
              </div>
            </div>
          </Card>

          {/* Target vs Transcript */}
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-lg">Câu nói</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Câu mẫu
                </p>
                <p className="text-lg font-medium">{result.targetText}</p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Bạn đã nói
                </p>
                <p className="text-lg font-medium">{result.transcript}</p>
              </div>
            </div>
          </Card>

          {/* Detailed Scores */}
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-lg">Chi tiết đánh giá</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: 'Phát âm', score: result.score.pronunciation, icon: Mic },
                { label: 'Độ trôi chảy', score: result.score.fluency, icon: TrendingUp },
                { label: 'Ngữ điệu', score: result.score.intonation, icon: Volume2 },
                { label: 'Độ chính xác', score: result.score.accuracy, icon: CheckCircle },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(item.score)}`}>
                      {item.score}
                    </span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Word Analysis */}
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-lg">Phân tích từng từ</h3>
            <div className="flex flex-wrap gap-2">
              {result.wordAnalysis.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    word.isCorrect
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}
                >
                  {word.isCorrect ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{word.word}</span>
                  <Badge variant="outline" className="text-xs">
                    {word.score}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Feedback */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            {result.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                  <h4 className="mb-2 font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Điểm mạnh
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 dark:text-green-400">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                  <h4 className="mb-2 font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                    Gợi ý cải thiện
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-700 dark:text-blue-400">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 pt-4"
          >
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Thử lại
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
            {onContinue && (
              <Button
                onClick={onContinue}
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="h-4 w-4" />
                Tiếp tục
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
