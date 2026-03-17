import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  MessageSquare, 
  FileText,
  Users,
  Calendar,
  ClipboardList,
  Sparkles,
  Search,
  Inbox,
  FolderOpen
} from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <Card className="max-w-md w-full p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
        >
          <Icon className="size-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button 
              onClick={action.onClick}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Specific empty states
export function NoSessionsEmpty({ onCreateSession }: { onCreateSession?: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No Sessions Yet"
      description="Start your learning journey by exploring available sessions or wait for your teacher to assign new content."
      action={onCreateSession ? {
        label: "Browse Sessions",
        onClick: onCreateSession
      } : undefined}
    />
  );
}

export function NoLessonsEmpty({ onCreateLesson }: { onCreateLesson?: () => void }) {
  return (
    <EmptyState
      icon={GraduationCap}
      title="No Lessons Available"
      description="This session doesn't have any lessons yet. Check back later or contact your teacher."
      action={onCreateLesson ? {
        label: "Create Lesson",
        onClick: onCreateLesson
      } : undefined}
    />
  );
}

export function NoAchievementsEmpty() {
  return (
    <EmptyState
      icon={Trophy}
      title="No Achievements Yet"
      description="Complete lessons and practice regularly to unlock your first achievement!"
      action={{
        label: "Start Learning",
        onClick: () => window.location.href = '/sessions'
      }}
    />
  );
}

export function NoMessagesEmpty({ onSendMessage }: { onSendMessage?: () => void }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Messages"
      description="Your inbox is empty. Start a conversation with your teacher or classmates."
      action={onSendMessage ? {
        label: "Send Message",
        onClick: onSendMessage
      } : undefined}
    />
  );
}

export function NoTestsEmpty({ onCreateTest }: { onCreateTest?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Tests Available"
      description="No tests have been assigned yet. Practice with lessons while you wait."
      action={onCreateTest ? {
        label: "Create Test",
        onClick: onCreateTest
      } : undefined}
    />
  );
}

export function NoStudentsEmpty({ onAddStudent }: { onAddStudent?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No Students Enrolled"
      description="Your class is empty. Invite students to join or wait for enrollments."
      action={onAddStudent ? {
        label: "Add Students",
        onClick: onAddStudent
      } : undefined}
      secondaryAction={{
        label: "Share Class Code",
        onClick: () => {}
      }}
    />
  );
}

export function NoClassesEmpty({ onCreateClass }: { onCreateClass?: () => void }) {
  return (
    <EmptyState
      icon={GraduationCap}
      title="No Classes Yet"
      description="Create your first class to start teaching and managing students."
      action={onCreateClass ? {
        label: "Create Class",
        onClick: onCreateClass
      } : undefined}
    />
  );
}

export function NoScheduleEmpty({ onAddSchedule }: { onAddSchedule?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No Scheduled Classes"
      description="Your schedule is clear. Add classes to help students stay on track."
      action={onAddSchedule ? {
        label: "Add Schedule",
        onClick: onAddSchedule
      } : undefined}
    />
  );
}

export function NoGradingEmpty() {
  return (
    <EmptyState
      icon={ClipboardList}
      title="Nothing to Grade"
      description="All caught up! No pending submissions at the moment."
    />
  );
}

export function NoContentEmpty({ onCreateContent }: { onCreateContent?: () => void }) {
  return (
    <EmptyState
      icon={Sparkles}
      title="No Content Available"
      description="Start creating engaging lessons and materials for your students."
      action={onCreateContent ? {
        label: "Create Content",
        onClick: onCreateContent
      } : undefined}
    />
  );
}

export function SearchEmpty({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={searchQuery 
        ? `No results found for "${searchQuery}". Try adjusting your search terms.`
        : "Try searching with different keywords."
      }
    />
  );
}

export function NoDataEmpty() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No Data Available"
      description="There's no data to display at the moment. Check back later."
    />
  );
}

// Animated illustration component
export function EmptyIllustration({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {children}
      
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-2 rounded-full bg-green-400"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -60],
            x: [0, (i - 1) * 20]
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 1
          }}
          style={{
            top: '20%',
            left: '50%',
          }}
        />
      ))}
    </motion.div>
  );
}
