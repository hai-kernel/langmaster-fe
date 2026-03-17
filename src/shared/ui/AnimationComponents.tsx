import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={className}
    >
      <Loader2 className={`${sizeClasses[size]} text-blue-500`} />
    </motion.div>
  );
}

interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

export function SuccessCheckmark({ size = 'md', onComplete }: SuccessCheckmarkProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      onAnimationComplete={onComplete}
      className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center shadow-xl relative`}
    >
      {/* Ripple effect */}
      <motion.div
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full bg-green-500"
      />
      <motion.div
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full bg-green-400"
      />
      
      <CheckCircle className={`${iconSizes[size]} text-white relative z-10`} />
    </motion.div>
  );
}

interface ErrorShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}

export function ErrorShake({ children, trigger, onComplete }: ErrorShakeProps) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, -5, 5, 0],
              transition: { duration: 0.5 },
            }
          : {}
      }
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
}

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 shadow-lg"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
      </motion.div>
      <p className="text-sm font-medium text-red-700 dark:text-red-400 flex-1">
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 shadow-lg"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
      </motion.div>
      <p className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

interface WarningMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function WarningMessage({ message, onDismiss }: WarningMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex items-center gap-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-4 shadow-lg"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
        }}
      >
        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
      </motion.div>
      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 flex-1">
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-yellow-400 hover:text-yellow-600 transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

// Skeleton loader for content loading states
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Bounce animation for interactive elements
export function BounceOnHover({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10,
        },
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// Scale animation for buttons
export function ScaleButton({ children, onClick, className = '' }: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`transition-all duration-200 ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Fade in animation for content
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.5,
}: { 
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

// Slide in from side
export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
}) {
  const initialPosition = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  };

  return (
    <motion.div
      initial={{ ...initialPosition[direction], opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
export function StaggerChildren({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
}
