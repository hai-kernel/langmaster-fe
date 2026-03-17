// Core Types for English Learning App

export type LevelType = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = 'video' | 'pronunciation' | 'ai-conversation' | 'flashcard';

export type LessonStatus = 'locked' | 'in-progress' | 'completed';

export type SessionStatus = 'locked' | 'in-progress' | 'completed';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  totalLessonsCompleted: number;
  enrolledClasses?: string[]; // IDs of classes the student is enrolled in
}

export interface Class {
  id: string;
  name: string;
  description: string;
  teacherName: string;
  teacherId: string;
  teacherAvatar?: string;
  studentCount: number;
  schedule?: string; // e.g., "Mon, Wed, Fri - 9:00 AM"
  level: LevelType;
  color?: string; // Theme color for the class card
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  level: LevelType;
  thumbnail?: string;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: number; // in minutes
  status: SessionStatus;
  order: number;
}

export interface Lesson {
  id: string;
  sessionId: string;
  title: string;
  type: LessonType;
  description: string;
  duration: number; // in minutes
  status: LessonStatus;
  order: number;
  videoUrl?: string;
  subtitle?: SubtitleSegment[];
  targetWords?: string[];
  minScore?: number; // minimum score to pass
}

export interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words: SubtitleWord[];
}

export interface SubtitleWord {
  text: string;
  startTime: number;
  endTime: number;
  pronunciation?: string;
  meaning?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
  imageUrl?: string;
  learned: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

export interface PronunciationScore {
  overall: number; // 0-100
  pronunciation: number;
  fluency: number;
  intonation: number;
  accuracy: number;
}

export interface PronunciationResult {
  score: PronunciationScore;
  transcript: string;
  targetText: string;
  wordAnalysis: WordAnalysis[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface WordAnalysis {
  word: string;
  isCorrect: boolean;
  score: number;
  expectedPronunciation: string;
  actualPronunciation?: string;
  feedback?: string;
}

export interface UserProgress {
  userId: string;
  currentSessionId: string;
  currentLessonId: string;
  completedSessions: string[];
  completedLessons: string[];
  lessonScores: { [lessonId: string]: number };
  vocabularyProgress: { [wordId: string]: number };
  lastActiveDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
}