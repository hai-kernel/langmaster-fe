import { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Slider } from '@/app/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  FastForward,
  Rewind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onMuteToggle: () => void;
  onSeek?: (time: number) => void;
  showWaveform?: boolean;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}

// Waveform animation bars
const WaveformBars = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className="flex items-center justify-center gap-[2px] h-12 px-4">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full"
          animate={
            isPlaying
              ? {
                  height: [
                    `${20 + Math.random() * 60}%`,
                    `${20 + Math.random() * 60}%`,
                    `${20 + Math.random() * 60}%`,
                  ],
                }
              : { height: '20%' }
          }
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Speed control options
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  onPlayPause,
  onRestart,
  onMuteToggle,
  onSeek,
  showWaveform = true,
  playbackSpeed = 1,
  onSpeedChange,
  className = '',
}: AudioPlayerProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progress = (currentTime / duration) * 100;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    if (onSeek) {
      const newTime = (value[0] / 100) * duration;
      onSeek(newTime);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Waveform Visualization */}
      {showWaveform && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-blue-200/50 dark:border-gray-700"
        >
          <WaveformBars isPlaying={isPlaying} />
          
          {/* Play/Pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {isPlaying ? (
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Pause className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-6 w-6 text-white drop-shadow-lg ml-1" />
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          {/* Progress indicator */}
          <motion.div
            className="absolute -top-8 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-lg"
            style={{
              left: `${progress}%`,
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isPlaying ? 1 : 0, y: isPlaying ? 0 : 10 }}
          >
            {formatTime(currentTime)}
          </motion.div>
        </div>
        
        {/* Time labels */}
        <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons - Larger and more prominent */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Restart Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={onRestart}
              className="h-12 w-12 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Rewind Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onSeek && onSeek(Math.max(0, currentTime - 5))}
              className="h-12 w-12 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Rewind className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Play/Pause Button - Primary and Large */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={onPlayPause}
              className="h-16 w-16 rounded-full p-0 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 text-white" />
              ) : (
                <Play className="h-7 w-7 text-white ml-1" />
              )}
            </Button>
          </motion.div>

          {/* Forward Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onSeek && onSeek(Math.min(duration, currentTime + 5))}
              className="h-12 w-12 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <FastForward className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Volume Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={onMuteToggle}
              className="h-12 w-12 rounded-full p-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-red-500" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Speed Control */}
        {onSpeedChange && (
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="h-12 px-4 font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 min-w-[80px]"
              >
                {playbackSpeed}x
              </Button>
            </motion.div>

            {/* Speed Menu */}
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-2 min-w-[100px] z-50"
                >
                  {SPEED_OPTIONS.map((speed) => (
                    <motion.button
                      key={speed}
                      onClick={() => {
                        onSpeedChange(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        speed === playbackSpeed
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      {speed}x
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
