import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface AnimatedMascotProps {
  mood?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  message?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function AnimatedMascot({ 
  mood = 'happy', 
  message,
  position = 'bottom-right' 
}: AnimatedMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setIsVisible(true);
    if (message) {
      setCurrentMessage(message);
    }
  }, [message]);

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-24 right-8',
    'top-left': 'top-24 left-8',
  };

  const moodEmojis = {
    happy: '😊',
    excited: '🤩',
    thinking: '🤔',
    celebrating: '🎉',
  };

  const moodColors = {
    happy: 'from-yellow-400 to-orange-400',
    excited: 'from-pink-400 to-purple-400',
    thinking: 'from-blue-400 to-cyan-400',
    celebrating: 'from-green-400 to-emerald-400',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}
    >
      {/* Speech Bubble */}
      {currentMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-full mb-4 right-0 max-w-xs"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {currentMessage}
            </p>
            {/* Tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-gray-200 dark:border-gray-700 transform rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Mascot Character */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: mood === 'celebrating' ? [0, -5, 5, -5, 0] : 0,
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          },
          rotate: {
            repeat: mood === 'celebrating' ? Infinity : 0,
            duration: 0.5,
          },
        }}
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${moodColors[mood]} flex items-center justify-center shadow-2xl`}
      >
        <motion.div
          animate={{
            scale: mood === 'excited' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            repeat: mood === 'excited' ? Infinity : 0,
            duration: 0.6,
          }}
          className="text-4xl"
        >
          {moodEmojis[mood]}
        </motion.div>

        {/* Sparkles effect for celebrating */}
        {mood === 'celebrating' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos((i * Math.PI) / 3) * 40],
                  y: [0, Math.sin((i * Math.PI) / 3) * 40],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.1,
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
              />
            ))}
          </>
        )}

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${moodColors[mood]} opacity-50 blur-xl -z-10`} />
      </motion.div>
    </motion.div>
  );
}
