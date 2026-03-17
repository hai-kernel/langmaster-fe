import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/app/components/ui/sonner';
import { useAuthStore } from '@/store/authStore';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { RouterSetup } from '@/app/components/RouterSetup';
import { useEffect } from 'react';

// PWA & Accessibility
import { registerServiceWorker, initInstallPrompt, initNetworkListeners } from '@/utils/pwa';
import { initAccessibility } from '@/utils/accessibility';

// Onboarding
import { WelcomeScreen } from '@/features/onboarding/WelcomeScreen';
import { LevelSelection } from '@/features/onboarding/LevelSelection';
import { LearningGoal } from '@/features/onboarding/LearningGoal';
import { FaceEnrollment } from '@/features/onboarding/FaceEnrollment';

// Auth
import { Login } from '@/features/auth/Login';
import { Register } from '@/features/auth/Register';

// Layout
import { AppLayout } from '@/app/components/layout/AppLayout';
import { ProtectedRoute } from '@/app/components/layout/ProtectedRoute';

// Student
import { Dashboard } from '@/features/user/Dashboard';
import { SessionOverview } from '@/features/session/SessionOverview';
import { SessionDetail } from '@/features/session/SessionDetail';
import { VocabularyScreen } from '@/features/vocabulary/VocabularyScreen';
import { ProfileScreen } from '@/features/user/ProfileScreen';
import { VideoLesson } from '@/features/lesson/VideoLesson';
import { PronunciationPractice } from '@/features/lesson/PronunciationPractice';
import { AIConversation } from '@/features/lesson/AIConversation';
import { StudentSettings } from '@/features/settings/StudentSettings';
import { TestsScreen } from '@/features/test/TestsScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { AchievementsScreen } from '@/features/gamification/AchievementsScreen';

// Student Lessons
import { VideoConversationLesson } from '@/features/student/lessons/VideoConversationLesson';
import { PronunciationLesson } from '@/features/student/lessons/PronunciationLesson';
import { AIConversationLesson } from '@/features/student/lessons/AIConversationLesson';
import { FlashcardLesson } from '@/features/student/lessons/FlashcardLesson';
import { LessonRouter } from '@/features/lesson/LessonRouter';
import { TestTaking } from '@/features/test/TestTaking';
import { StudentClassDetail } from '@/features/student/StudentClassDetail';

// Teacher
import { TeacherDashboard } from '@/features/teacher/TeacherDashboard';
import { TeacherSettings } from '@/features/settings/TeacherSettings';
import { StudentsManagement } from '@/features/teacher/StudentsManagement';
import { ClassesManagement } from '@/features/teacher/ClassesManagement';
import { ClassDetail } from '@/features/teacher/ClassDetail';
import { ContentLibrary } from '@/features/teacher/ContentLibrary';
import { CreateLesson } from '@/features/teacher/CreateLesson';
import { CreateTest } from '@/features/teacher/CreateTest';
import { Curriculum } from '@/features/teacher/Curriculum';
import { Schedule } from '@/features/teacher/Schedule';
import { TeacherAnalytics } from '@/features/teacher/Analytics';
import { StudentDetail } from '@/features/teacher/StudentDetail';
import { GradingCenter } from '@/features/teacher/GradingCenter';

// Admin
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { UserManagement } from '@/features/admin/UserManagement';
import { ContentManagement } from '@/features/admin/ContentManagement';
import { PlatformAnalytics } from '@/features/admin/PlatformAnalytics';
import { AdminSettings } from '@/features/settings/AdminSettings';
import { AdminClassesManagement } from '@/features/admin/ClassesManagement';
import { AIUsage } from '@/features/admin/AIUsage';
import { FaceIDManagement } from '@/features/admin/FaceIDManagement';
import { NotificationsManagement } from '@/features/admin/NotificationsManagement';
import { AdminCurriculumManagement } from '@/features/admin/CurriculumManagement';
import { AdminSessionManagement } from '@/features/admin/AdminSessionManagement';
import AdminTopicManagement from '@/features/admin/AdminTopicManagement';
import { AdminTestManagement } from '@/features/admin/AdminTestManagement';

// Examples & Demo
import { UXEnhancementsDemo } from '@/features/examples/UXEnhancementsDemo';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    initInstallPrompt();
    initNetworkListeners();
    
    // Initialize accessibility features
    initAccessibility();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouterSetup />
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes - Onboarding */}
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/onboarding/level" element={<LevelSelection />} />
          <Route path="/onboarding/goal" element={<LearningGoal />} />
          <Route path="/onboarding/face-enrollment" element={<FaceEnrollment />} />

          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/register" 
            element={<Register />} 
          />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sessions" element={<SessionOverview />} />
              <Route path="/sessions/:sessionId" element={<SessionDetail />} />
              <Route path="/vocabulary" element={<VocabularyScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/settings" element={<StudentSettings />} />
              <Route path="/lessons/video/:lessonId" element={<VideoLesson />} />
              <Route path="/lessons/pronunciation/:lessonId" element={<PronunciationPractice />} />
              <Route path="/lessons/conversation/:lessonId" element={<AIConversation />} />
              <Route path="/tests" element={<TestsScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/achievements" element={<AchievementsScreen />} />
              <Route path="/lessons/video-conversation/:lessonId" element={<VideoConversationLesson />} />
              <Route path="/lessons/pronunciation-lesson/:lessonId" element={<PronunciationLesson />} />
              <Route path="/lessons/ai-conversation-lesson/:lessonId" element={<AIConversationLesson />} />
              <Route path="/lessons/flashcard-lesson/:lessonId" element={<FlashcardLesson />} />
              <Route path="/lessons/:lessonId" element={<LessonRouter />} />
              <Route path="/tests/:testId" element={<TestTaking />} />
              <Route path="/classes/:classId" element={<StudentClassDetail />} />
            </Route>
          </Route>

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route element={<AppLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/students" element={<StudentsManagement />} />
              <Route path="/teacher/classes" element={<ClassesManagement />} />
              <Route path="/teacher/classes/:classId" element={<ClassDetail />} />
              <Route path="/teacher/lessons" element={<ContentLibrary />} />
              <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
              <Route path="/teacher/settings" element={<TeacherSettings />} />
              <Route path="/teacher/create-lesson" element={<CreateLesson />} />
              <Route path="/teacher/create-test" element={<CreateTest />} />
              <Route path="/teacher/curriculum" element={<Curriculum />} />
              <Route path="/teacher/schedule" element={<Schedule />} />
              <Route path="/teacher/student/:studentId" element={<StudentDetail />} />
              <Route path="/teacher/grading-center" element={<GradingCenter />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/content" element={<ContentManagement />} />
              <Route path="/admin/analytics" element={<PlatformAnalytics />} />
              <Route path="/admin/system" element={<div className="p-6">System Configuration (Coming Soon)</div>} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/classes" element={<AdminClassesManagement />} />
              <Route path="/admin/ai-usage" element={<AIUsage />} />
              <Route path="/admin/face-id" element={<FaceIDManagement />} />
              <Route path="/admin/notifications" element={<NotificationsManagement />} />
              <Route path="/admin/curriculum" element={<AdminCurriculumManagement />} />
              <Route path="/admin/sessions" element={<AdminSessionManagement />} />
              <Route path="/admin/topics" element={<AdminTopicManagement />} />
              <Route path="/admin/tests" element={<AdminTestManagement />} />
            </Route>
          </Route>

          {/* Examples & Demo */}
          <Route path="/examples/ux-enhancements" element={<UXEnhancementsDemo />} />

          {/* Default redirect based on auth status */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === 'teacher' ? '/teacher' : user?.role === 'admin' ? '/admin' : '/'} replace />
              ) : (
                <Navigate to="/welcome" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}