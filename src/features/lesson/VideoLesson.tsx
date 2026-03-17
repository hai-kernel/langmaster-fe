import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { AudioPlayer } from '@/shared/ui/AudioPlayer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ChevronLeft,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLessonById } from '@/services/mockData';
import type { SubtitleSegment } from '@/types';

// Mock subtitle data
const mockSubtitles: SubtitleSegment[] = [
  {
    id: 'sub-1',
    text: 'Hello! Nice to meet you.',
    startTime: 0,
    endTime: 2.5,
    words: [
      { text: 'Hello!', startTime: 0, endTime: 0.8, pronunciation: '/həˈloʊ/', meaning: 'Xin chào' },
      { text: 'Nice', startTime: 0.9, endTime: 1.3, pronunciation: '/naɪs/', meaning: 'Tốt đẹp' },
      { text: 'to meet', startTime: 1.4, endTime: 1.8, pronunciation: '/tuː miːt/', meaning: 'gặp' },
      { text: 'you.', startTime: 1.9, endTime: 2.5, pronunciation: '/juː/', meaning: 'bạn' },
    ],
  },
  {
    id: 'sub-2',
    text: 'My name is Sarah.',
    startTime: 2.8,
    endTime: 4.5,
    words: [
      { text: 'My', startTime: 2.8, endTime: 3.0, pronunciation: '/maɪ/', meaning: 'của tôi' },
      { text: 'name', startTime: 3.1, endTime: 3.5, pronunciation: '/neɪm/', meaning: 'tên' },
      { text: 'is', startTime: 3.6, endTime: 3.8, pronunciation: '/ɪz/', meaning: 'là' },
      { text: 'Sarah.', startTime: 3.9, endTime: 4.5, pronunciation: '/ˈsærə/', meaning: 'Sarah' },
    ],
  },
  {
    id: 'sub-3',
    text: "I'm from New York.",
    startTime: 4.8,
    endTime: 6.5,
    words: [
      { text: "I'm", startTime: 4.8, endTime: 5.0, pronunciation: '/aɪm/', meaning: 'Tôi là' },
      { text: 'from', startTime: 5.1, endTime: 5.4, pronunciation: '/frɒm/', meaning: 'đến từ' },
      { text: 'New York.', startTime: 5.5, endTime: 6.5, pronunciation: '/nuː jɔːrk/', meaning: 'New York' },
    ],
  },
  {
    id: 'sub-4',
    text: 'What about you?',
    startTime: 6.8,
    endTime: 8.2,
    words: [
      { text: 'What', startTime: 6.8, endTime: 7.0, pronunciation: '/wɒt/', meaning: 'Cái gì' },
      { text: 'about', startTime: 7.1, endTime: 7.5, pronunciation: '/əˈbaʊt/', meaning: 'về' },
      { text: 'you?', startTime: 7.6, endTime: 8.2, pronunciation: '/juː/', meaning: 'bạn' },
    ],
  },
];

export function VideoLesson() {
  const { selectedLessonId, setCurrentView, completeLesson, addXP } = useAppStore();
  const lesson = getLessonById(selectedLessonId || '');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // Mock duration
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showVocab, setShowVocab] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);

  // Use lesson subtitles if available, otherwise use mock data
  const subtitles = lesson?.subtitle || mockSubtitles;

  // Get current subtitle based on time
  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  // Simulate video playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + (0.1 * playbackSpeed);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleComplete = () => {
    completeLesson(selectedLessonId || '', 95);
    addXP(50);
    setCurrentView('session-detail');
  };

  const progress = (currentTime / duration) * 100;

  if (!lesson) {
    return (
      <div className="container mx-auto p-4">
        <p>Không tìm thấy bài học</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('session-detail')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Badge variant="outline" className="gap-1">
            <BookOpen className="h-3 w-3" />
            Video Lesson
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{lesson.description}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                {/* Video Container */}
                <div
                  ref={videoRef}
                  className="relative aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
                >
                  {/* Mock Video Display */}
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <motion.div
                      animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-center"
                    >
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mx-auto">
                        {isPlaying ? (
                          <Pause className="h-12 w-12" />
                        ) : (
                          <Play className="h-12 w-12 ml-2" />
                        )}
                      </div>
                      <p className="text-xl font-semibold">Video Conversation</p>
                      <p className="text-sm opacity-80">Greetings & Introductions</p>
                    </motion.div>
                  </div>

                  {/* Subtitle Overlay */}
                  <AnimatePresence mode="wait">
                    {currentSubtitle && (
                      <motion.div
                        key={currentSubtitle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-6 left-6 right-6"
                      >
                        <div className="rounded-lg bg-black/80 px-4 py-3 text-center backdrop-blur-sm">
                          <p className="text-lg text-white font-medium">
                            {currentSubtitle.text}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      {isPlaying ? (
                        <Pause className="h-10 w-10" />
                      ) : (
                        <Play className="h-10 w-10 ml-2" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-800">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{currentTime.toFixed(1)}s</span>
                      <span>{duration}s</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRestart}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <Button size="sm" variant="outline">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Complete Button */}
              {currentTime >= duration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Hoàn thành bài học (+50 XP)
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Vocabulary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Từ vựng</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowVocab(!showVocab)}
                  >
                    {showVocab ? 'Ẩn' : 'Hiện'}
                  </Button>
                </div>

                <AnimatePresence>
                  {showVocab && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {subtitles.map((subtitle) =>
                        subtitle.words.map((word, index) => (
                          <motion.div
                            key={`${subtitle.id}-${index}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedWord(word)}
                            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                              selectedWord?.text === word.text
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-bold text-lg">{word.text}</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {word.pronunciation}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {word.meaning}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Tips Card */}
              <Card className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <h3 className="mb-2 font-bold flex items-center gap-2">
                  💡 Mẹo học tập
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Xem video nhiều lần để quen với âm thanh</li>
                  <li>• Nhấp vào từ vựng để xem nghĩa</li>
                  <li>• Thử lặp lại theo từng câu</li>
                  <li>• Chú ý đến phát âm và ngữ điệu</li>
                </ul>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}