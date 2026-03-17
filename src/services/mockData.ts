import type { 
  Session, 
  Lesson, 
  VocabularyWord, 
  User, 
  UserProgress,
  Badge,
  Achievement,
  SubtitleSegment,
  Class
} from '@/types';

// Mock User Data
export const mockUser: User = {
  id: 'user-1',
  name: 'Nguyễn Văn A',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  level: 5,
  xp: 1250,
  streak: 7,
  totalLessonsCompleted: 12,
  enrolledClasses: ['class-1', 'class-2'],
};

// Mock Classes Data
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'English Conversation - Beginner',
    description: 'Lớp học giao tiếp tiếng Anh cơ bản cho người mới bắt đầu',
    teacherName: 'Ms. Sarah Johnson',
    teacherId: 'teacher-1',
    teacherAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    studentCount: 24,
    schedule: 'Thứ 2, 4, 6 - 7:00 PM',
    level: 'beginner',
    color: 'from-green-400 to-green-500',
    startDate: new Date('2026-01-05'),
    endDate: new Date('2026-03-28'),
    isActive: true,
  },
  {
    id: 'class-2',
    name: 'Business English',
    description: 'Tiếng Anh chuyên ngành cho môi trường công sở',
    teacherName: 'Mr. David Lee',
    teacherId: 'teacher-2',
    teacherAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    studentCount: 18,
    schedule: 'Thứ 3, 5 - 6:30 PM',
    level: 'intermediate',
    color: 'from-blue-400 to-blue-500',
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-04-10'),
    isActive: true,
  },
  {
    id: 'class-3',
    name: 'IELTS Preparation',
    description: 'Luyện thi IELTS Speaking & Listening',
    teacherName: 'Ms. Emily Chen',
    teacherId: 'teacher-3',
    teacherAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    studentCount: 15,
    schedule: 'Thứ 7, CN - 9:00 AM',
    level: 'advanced',
    color: 'from-purple-400 to-purple-500',
    startDate: new Date('2025-12-15'),
    endDate: new Date('2026-02-28'),
    isActive: false, // User not enrolled in this class
  },
];

// Mock Sessions Data
export const mockSessions: Session[] = [
  {
    id: 'session-1',
    title: 'Giới thiệu bản thân',
    description: 'Học cách tự giới thiệu và hỏi thăm người khác',
    level: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    totalLessons: 5,
    completedLessons: 3,
    estimatedTime: 25,
    status: 'in-progress',
    order: 1,
  },
  {
    id: 'session-2',
    title: 'Mua sắm & Giá cả',
    description: 'Giao tiếp khi đi mua sắm và hỏi giá',
    level: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    totalLessons: 6,
    completedLessons: 0,
    estimatedTime: 30,
    status: 'locked',
    order: 2,
  },
  {
    id: 'session-3',
    title: 'Đặt món ở nhà hàng',
    description: 'Học từ vựng và cách gọi món ăn',
    level: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    totalLessons: 5,
    completedLessons: 0,
    estimatedTime: 28,
    status: 'locked',
    order: 3,
  },
  {
    id: 'session-4',
    title: 'Hỏi đường',
    description: 'Cách hỏi và chỉ đường bằng tiếng Anh',
    level: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    totalLessons: 4,
    completedLessons: 0,
    estimatedTime: 22,
    status: 'locked',
    order: 4,
  },
  {
    id: 'session-5',
    title: 'Phỏng vấn xin việc',
    description: 'Chuẩn bị cho buổi phỏng vấn bằng tiếng Anh',
    level: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    totalLessons: 8,
    completedLessons: 0,
    estimatedTime: 45,
    status: 'locked',
    order: 5,
  },
];

// Mock Lessons Data
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1-1',
    sessionId: 'session-1',
    title: 'Video: Hello! Nice to meet you',
    type: 'video',
    description: 'Xem và học hội thoại giới thiệu cơ bản',
    duration: 5,
    status: 'completed',
    order: 1,
    videoUrl: 'https://example.com/video1.mp4',
    targetWords: ['hello', 'nice', 'meet', 'name'],
    subtitle: [
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
    ],
  },
  {
    id: 'lesson-1-2',
    sessionId: 'session-1',
    title: 'Luyện phát âm: Greetings',
    type: 'pronunciation',
    description: 'Luyện phát âm các câu chào hỏi',
    duration: 8,
    status: 'completed',
    order: 2,
    minScore: 70,
  },
  {
    id: 'lesson-1-3',
    sessionId: 'session-1',
    title: 'Flashcard: Từ vựng giới thiệu',
    type: 'flashcard',
    description: 'Học và ghi nhớ từ vựng quan trọng',
    duration: 5,
    status: 'completed',
    order: 3,
  },
  {
    id: 'lesson-1-4',
    sessionId: 'session-1',
    title: 'Hội thoại với AI',
    type: 'ai-conversation',
    description: 'Thực hành giới thiệu bản thân với AI',
    duration: 10,
    status: 'in-progress',
    order: 4,
    minScore: 75,
  },
  {
    id: 'lesson-1-5',
    sessionId: 'session-1',
    title: 'Bài kiểm tra cuối',
    type: 'pronunciation',
    description: 'Kiểm tra tổng hợp kỹ năng',
    duration: 7,
    status: 'locked',
    order: 5,
    minScore: 80,
  },
];

// Mock Vocabulary
export const mockVocabulary: VocabularyWord[] = [
  {
    id: 'vocab-1',
    word: 'Hello',
    meaning: 'Xin chào',
    pronunciation: '/həˈloʊ/',
    example: 'Hello! How are you today?',
    learned: true,
    reviewCount: 5,
    lastReviewed: new Date('2026-01-14'),
  },
  {
    id: 'vocab-2',
    word: 'Nice to meet you',
    meaning: 'Rất vui được gặp bạn',
    pronunciation: '/naɪs tuː miːt juː/',
    example: 'Nice to meet you, John!',
    learned: true,
    reviewCount: 3,
    lastReviewed: new Date('2026-01-13'),
  },
  {
    id: 'vocab-3',
    word: 'Introduction',
    meaning: 'Giới thiệu',
    pronunciation: '/ˌɪntrəˈdʌkʃn/',
    example: 'Let me make an introduction.',
    learned: false,
    reviewCount: 1,
  },
  {
    id: 'vocab-4',
    word: 'Pleased',
    meaning: 'Hài lòng, vui mừng',
    pronunciation: '/pliːzd/',
    example: 'I am pleased to meet you.',
    learned: false,
    reviewCount: 0,
  },
];

// Mock User Progress
export const mockUserProgress: UserProgress = {
  userId: 'user-1',
  currentSessionId: 'session-1',
  currentLessonId: 'lesson-1-4',
  completedSessions: [],
  completedLessons: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3'],
  lessonScores: {
    'lesson-1-1': 95,
    'lesson-1-2': 88,
    'lesson-1-3': 100,
  },
  vocabularyProgress: {
    'vocab-1': 100,
    'vocab-2': 85,
    'vocab-3': 45,
  },
  lastActiveDate: new Date(),
};

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🎯',
    unlockedAt: new Date('2026-01-10'),
  },
  {
    id: 'badge-2',
    name: 'Week Warrior',
    description: 'Học liên tục 7 ngày',
    icon: '🔥',
    unlockedAt: new Date('2026-01-14'),
  },
  {
    id: 'badge-3',
    name: 'Pronunciation Master',
    description: 'Đạt điểm 90+ trong 5 bài phát âm',
    icon: '🎤',
  },
  {
    id: 'badge-4',
    name: 'Vocabulary King',
    description: 'Học 100 từ vựng',
    icon: '📚',
  },
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'achievement-1',
    title: 'Hoàn thành 5 bài học',
    description: 'Tiếp tục phát huy!',
    xpReward: 50,
    progress: 3,
    target: 5,
    completed: false,
  },
  {
    id: 'achievement-2',
    title: 'Đạt 1000 XP',
    description: 'Bạn đang học rất tốt!',
    xpReward: 100,
    progress: 1250,
    target: 1000,
    completed: true,
  },
  {
    id: 'achievement-3',
    title: 'Học 7 ngày liên tục',
    description: 'Duy trì chuỗi ngày học!',
    xpReward: 75,
    progress: 7,
    target: 7,
    completed: true,
  },
];

// Helper function to get lessons by session
export const getLessonsBySessionId = (sessionId: string): Lesson[] => {
  return mockLessons.filter(lesson => lesson.sessionId === sessionId);
};

// Helper function to get session by id
export const getSessionById = (sessionId: string): Session | undefined => {
  return mockSessions.find(session => session.id === sessionId);
};

// Helper function to get lesson by id
export const getLessonById = (lessonId: string): Lesson | undefined => {
  return mockLessons.find(lesson => lesson.id === lessonId);
};

// Helper function to get classes by student
export const getClassesByStudentId = (studentId: string): Class[] => {
  const user = mockUser; // In a real app, fetch user by studentId
  if (!user.enrolledClasses) return [];
  return mockClasses.filter(cls => user.enrolledClasses?.includes(cls.id));
};

// Helper function to get class by id
export const getClassById = (classId: string): Class | undefined => {
  return mockClasses.find(cls => cls.id === classId);
};