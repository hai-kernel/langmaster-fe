import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  totalLessonsCompleted: number;
  faceIdEnrolled: boolean;
}

export interface CourseInfo {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  teacherName: string;
  totalSessions: number;
  completedSessions: number;
  progressPercent: number;
}

export interface SessionInfo {
  id: number;
  title: string;
  orderIndex: number;
  courseId: number;
  courseName: string;
  lessonCount: number;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export interface Badge {
  id: number;
  name: string;
  iconUrl: string;
  conditionRule: Record<string, any>;
  earnedAt: string | null;
  isEarned: boolean;
}

export interface DashboardStats {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  streak: number;
  lessonsCompleted: number;
  wordsLearned: number;
  testsCompleted: number;
  badgesEarned: number;
}

export interface StudentDashboard {
  user: UserInfo;
  enrolledClasses: any[];
  courses: CourseInfo[];
  notifications: Notification[];
  badges: Badge[];
  stats: DashboardStats;
}

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);

  const fetchDashboard = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.student.getDashboard();
      setData(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
  }, [accessToken]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.student.getCourses();
      setCourses(response.data.data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  };
}

export function useSessionsByCourse(courseId: number) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.session.getByCourse(courseId);
      setSessions(response.data.data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchSessions();
    }
  }, [courseId]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
}

export function useSessionById(sessionId: number | null) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await apiService.session.getById(sessionId);
      setSession(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch session:', err);
      setError(err.message || 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  return {
    session,
    loading,
    error,
    refetch: fetchSession,
  };
}

export interface LessonInfo {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  sessionId: number;
  type: 'VIDEO' | 'QUIZ' | 'VOCAB' | 'SPEAKING';
  orderIndex: number;
  durationMinutes?: number;
  videoUrl?: string;
  youtubeUrl?: string;
  s3Status?: string;
  contentPayload?: Record<string, any>;
}

export function useLessonsBySession(sessionId: number) {
  const [lessons, setLessons] = useState<LessonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await apiService.lesson.getBySession(sessionId);
      setLessons(response.data.data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch lessons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchLessons();
    }
  }, [sessionId]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
  };
}
