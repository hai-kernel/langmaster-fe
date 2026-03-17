import { useState, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecordingButtonProps {
  isRecording: boolean;
  recordingTime: number;
  maxDuration?: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  disabled?: boolean;
}

// Recording waveform animation
const RecordingWaveform = () => {
  const bars = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-white rounded-full"
          animate={{
            height: [
              `${30 + Math.random() * 70}%`,
              `${30 + Math.random() * 70}%`,
              `${30 + Math.random() * 70}%`,
            ],
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export function RecordingButton({
  isRecording,
  recordingTime,
  maxDuration = 60,
  onStartRecording,
  onStopRecording,
  size = 'lg',
  showWaveform = true,
  disabled = false,
}: RecordingButtonProps) {
  const [pulse, setPulse] = useState(true);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = (recordingTime / maxDuration) * 100;

  // Button sizes
  const sizeClasses = {
    sm: 'h-20 w-20',
    md: 'h-28 w-28',
    lg: 'h-36 w-36',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Recording Button */}
      <div className="relative">
        {/* Glow effect rings */}
        <AnimatePresence>
          {isRecording && (
            <>
              {/* Outer glow ring */}
              <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                  scale: [1, 1.5, 1.8],
                  opacity: [0.6, 0.3, 0],
                }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-red-500 blur-xl`}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
              
              {/* Middle glow ring */}
              <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                  scale: [1, 1.3, 1.5],
                  opacity: [0.8, 0.4, 0],
                }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.3,
                }}
                className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-red-400 blur-lg`}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 shadow-2xl shadow-red-500/50'
              : 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50'
          }`}
          animate={
            isRecording
              ? {
                  boxShadow: [
                    '0 20px 60px rgba(239, 68, 68, 0.5)',
                    '0 20px 80px rgba(239, 68, 68, 0.7)',
                    '0 20px 60px rgba(239, 68, 68, 0.5)',
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Progress ring */}
          {isRecording && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.3 }}
                style={{
                  pathLength: progress / 100,
                  strokeDasharray: '289.027',
                  strokeDashoffset: `${289.027 * (1 - progress / 100)}`,
                }}
              />
            </svg>
          )}

          {/* Icon */}
          <motion.div
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="relative z-10"
          >
            {isRecording ? (
              <Square className={`${iconSizes[size]} text-white fill-white`} />
            ) : (
              <Mic className={`${iconSizes[size]} text-white drop-shadow-lg`} />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Timer Display */}
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="text-4xl font-bold text-red-500 mb-2 font-mono tabular-nums"
            >
              {formatTime(recordingTime)}
            </motion.div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              Đang thu âm...
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Nhấn để bắt đầu
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ghi âm giọng nói của bạn
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform Visualization */}
      <AnimatePresence>
        {isRecording && showWaveform && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 p-4 shadow-xl">
              <RecordingWaveform />
              <div className="mt-3 flex items-center justify-between text-white text-sm font-medium">
                <span>Level</span>
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-full ${
                        i < 3 ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}