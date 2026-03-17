// Assessment and Test Types

export interface Test {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'assessment' | 'final';
  questions: TestQuestion[];
  settings: TestSettings;
  createdBy: string; // teacherId
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSettings {
  timeLimit?: number; // in minutes, undefined = no limit
  passingScore: number; // percentage
  faceIdRequired: boolean;
  faceIdCheckInterval?: number; // minutes, for periodic check during test
  retakeAllowed: boolean;
  maxRetakes?: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean; // after submission
  availableFrom?: Date;
  availableTo?: Date;
}

export type QuestionType = 'listening' | 'speaking' | 'pronunciation' | 'vocabulary' | 'multiple-choice';

export interface TestQuestion {
  id: string;
  type: QuestionType;
  question: string;
  audioUrl?: string; // for listening questions
  targetText?: string; // for pronunciation questions
  options?: string[]; // for multiple choice
  correctAnswer?: string | number; // answer text or option index
  points: number;
  order: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  maxScore: number;
  passed: boolean;
  answers: TestAnswer[];
  faceIdVerifications: FaceIdVerification[];
  timeSpent: number; // in seconds
}

export interface TestAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  aiScore?: number; // for speaking/pronunciation
  feedback?: string;
}

export interface FaceIdVerification {
  timestamp: Date;
  success: boolean;
  confidence: number;
  imageData?: string; // base64 if needed for audit
}

export interface TestResult {
  attempt: TestAttempt;
  questionResults: QuestionResult[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface QuestionResult {
  question: TestQuestion;
  answer: TestAnswer;
  detailedFeedback?: string;
}
