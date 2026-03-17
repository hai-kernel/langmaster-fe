/**
 * Learning Engine Service
 * Handles XP calculation, level progression, achievements, and gamification
 */

import type { Achievement, Badge } from '@/types';

export interface XPCalculation {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  multiplier: number;
  breakdown: {
    source: string;
    amount: number;
  }[];
}

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  xpToNextLevel: number;
}

export interface StreakReward {
  days: number;
  xpBonus: number;
  badge?: Badge;
  milestone: boolean;
}

// XP Constants
export const XP_CONFIG = {
  // Base XP for different activities
  LESSON_COMPLETE: 50,
  SESSION_COMPLETE: 200,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 5, // per day
  
  // Score-based multipliers
  SCORE_EXCELLENT: 2.0, // 90-100%
  SCORE_GOOD: 1.5, // 80-89%
  SCORE_AVERAGE: 1.0, // 70-79%
  SCORE_BELOW_AVERAGE: 0.7, // below 70%
  
  // Activity bonuses
  FIRST_TRY_BONUS: 20,
  SPEED_BONUS: 15,
  CONSISTENCY_BONUS: 25,
  
  // Level progression
  XP_PER_LEVEL: 250,
  MAX_LEVEL: 100,
} as const;

/**
 * Calculate XP earned for completing a lesson
 */
export function calculateLessonXP(params: {
  lessonType: 'video' | 'pronunciation' | 'ai-conversation' | 'flashcard';
  score: number;
  duration: number;
  targetDuration: number;
  attempts: number;
  streak: number;
}): XPCalculation {
  const breakdown: { source: string; amount: number }[] = [];
  
  // Base XP
  let baseXP = XP_CONFIG.LESSON_COMPLETE;
  breakdown.push({ source: 'Lesson completion', amount: baseXP });
  
  // Score multiplier
  let multiplier = 1.0;
  if (params.score >= 90) {
    multiplier = XP_CONFIG.SCORE_EXCELLENT;
    breakdown.push({ source: 'Excellent score (90%+)', amount: baseXP * (multiplier - 1) });
  } else if (params.score >= 80) {
    multiplier = XP_CONFIG.SCORE_GOOD;
    breakdown.push({ source: 'Good score (80%+)', amount: baseXP * (multiplier - 1) });
  } else if (params.score >= 70) {
    multiplier = XP_CONFIG.SCORE_AVERAGE;
  } else {
    multiplier = XP_CONFIG.SCORE_BELOW_AVERAGE;
  }
  
  // Perfect score bonus
  let bonusXP = 0;
  if (params.score === 100) {
    bonusXP += XP_CONFIG.PERFECT_SCORE;
    breakdown.push({ source: 'Perfect score!', amount: XP_CONFIG.PERFECT_SCORE });
  }
  
  // First try bonus
  if (params.attempts === 1 && params.score >= 70) {
    bonusXP += XP_CONFIG.FIRST_TRY_BONUS;
    breakdown.push({ source: 'First try success', amount: XP_CONFIG.FIRST_TRY_BONUS });
  }
  
  // Speed bonus (completed faster than target)
  if (params.duration < params.targetDuration * 0.8) {
    bonusXP += XP_CONFIG.SPEED_BONUS;
    breakdown.push({ source: 'Speed bonus', amount: XP_CONFIG.SPEED_BONUS });
  }
  
  // Streak bonus
  if (params.streak >= 3) {
    const streakBonus = Math.min(params.streak * XP_CONFIG.STREAK_BONUS, 50);
    bonusXP += streakBonus;
    breakdown.push({ source: `${params.streak} day streak`, amount: streakBonus });
  }
  
  const totalXP = Math.round(baseXP * multiplier + bonusXP);
  
  return {
    baseXP,
    bonusXP,
    totalXP,
    multiplier,
    breakdown,
  };
}

/**
 * Calculate level and progress from total XP
 */
export function calculateLevelInfo(totalXP: number): LevelInfo {
  const currentLevel = Math.min(
    Math.floor(totalXP / XP_CONFIG.XP_PER_LEVEL) + 1,
    XP_CONFIG.MAX_LEVEL
  );
  
  const xpForCurrentLevel = (currentLevel - 1) * XP_CONFIG.XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_CONFIG.XP_PER_LEVEL;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
  const xpToNextLevel = xpForNextLevel - totalXP;
  
  return {
    currentLevel,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercentage,
    xpToNextLevel,
  };
}

/**
 * Calculate streak rewards
 */
export function calculateStreakReward(streakDays: number): StreakReward {
  const xpBonus = streakDays * XP_CONFIG.STREAK_BONUS;
  
  // Milestone badges at 7, 30, 100, 365 days
  let badge: Badge | undefined;
  let milestone = false;
  
  if (streakDays === 7) {
    milestone = true;
    badge = {
      id: 'streak_7',
      name: '7 Day Streak',
      description: 'Completed 7 days in a row!',
      icon: '🔥',
      unlockedAt: new Date(),
    };
  } else if (streakDays === 30) {
    milestone = true;
    badge = {
      id: 'streak_30',
      name: '30 Day Streak',
      description: 'One month of consistent learning!',
      icon: '🔥🔥',
      unlockedAt: new Date(),
    };
  } else if (streakDays === 100) {
    milestone = true;
    badge = {
      id: 'streak_100',
      name: '100 Day Streak',
      description: 'Century of dedication!',
      icon: '🔥🔥🔥',
      unlockedAt: new Date(),
    };
  } else if (streakDays === 365) {
    milestone = true;
    badge = {
      id: 'streak_365',
      name: 'Year Streak',
      description: 'A full year of learning!',
      icon: '👑',
      unlockedAt: new Date(),
    };
  }
  
  return {
    days: streakDays,
    xpBonus,
    badge,
    milestone,
  };
}

/**
 * Generate achievements based on user stats
 */
export function generateAchievements(stats: {
  lessonsCompleted: number;
  sessionsCompleted: number;
  perfectScores: number;
  averageScore: number;
  totalXP: number;
  streak: number;
  pronunciationPractices: number;
  conversationsCompleted: number;
}): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_lesson',
      title: 'First Steps',
      description: 'Complete your first lesson',
      xpReward: 10,
      progress: Math.min(stats.lessonsCompleted, 1),
      target: 1,
      completed: stats.lessonsCompleted >= 1,
    },
    {
      id: 'lesson_10',
      title: 'Learning Momentum',
      description: 'Complete 10 lessons',
      xpReward: 50,
      progress: Math.min(stats.lessonsCompleted, 10),
      target: 10,
      completed: stats.lessonsCompleted >= 10,
    },
    {
      id: 'lesson_50',
      title: 'Dedicated Learner',
      description: 'Complete 50 lessons',
      xpReward: 200,
      progress: Math.min(stats.lessonsCompleted, 50),
      target: 50,
      completed: stats.lessonsCompleted >= 50,
    },
    {
      id: 'lesson_100',
      title: 'Century Club',
      description: 'Complete 100 lessons',
      xpReward: 500,
      progress: Math.min(stats.lessonsCompleted, 100),
      target: 100,
      completed: stats.lessonsCompleted >= 100,
    },
    {
      id: 'perfect_5',
      title: 'Perfectionist',
      description: 'Get 5 perfect scores',
      xpReward: 100,
      progress: Math.min(stats.perfectScores, 5),
      target: 5,
      completed: stats.perfectScores >= 5,
    },
    {
      id: 'high_scorer',
      title: 'High Achiever',
      description: 'Maintain 85%+ average score',
      xpReward: 150,
      progress: stats.averageScore >= 85 ? 1 : 0,
      target: 1,
      completed: stats.averageScore >= 85,
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Reach a 30 day streak',
      xpReward: 300,
      progress: Math.min(stats.streak, 30),
      target: 30,
      completed: stats.streak >= 30,
    },
    {
      id: 'pronunciation_pro',
      title: 'Pronunciation Pro',
      description: 'Complete 20 pronunciation practices',
      xpReward: 100,
      progress: Math.min(stats.pronunciationPractices, 20),
      target: 20,
      completed: stats.pronunciationPractices >= 20,
    },
    {
      id: 'conversation_master',
      title: 'Conversation Master',
      description: 'Complete 15 AI conversations',
      xpReward: 150,
      progress: Math.min(stats.conversationsCompleted, 15),
      target: 15,
      completed: stats.conversationsCompleted >= 15,
    },
    {
      id: 'xp_1000',
      title: 'Rising Star',
      description: 'Earn 1,000 XP',
      xpReward: 100,
      progress: Math.min(stats.totalXP, 1000),
      target: 1000,
      completed: stats.totalXP >= 1000,
    },
    {
      id: 'xp_5000',
      title: 'Super Star',
      description: 'Earn 5,000 XP',
      xpReward: 300,
      progress: Math.min(stats.totalXP, 5000),
      target: 5000,
      completed: stats.totalXP >= 5000,
    },
  ];
  
  return achievements;
}

/**
 * Calculate session completion XP
 */
export function calculateSessionXP(params: {
  lessonsInSession: number;
  averageScore: number;
  timeSpent: number;
  targetTime: number;
}): XPCalculation {
  const breakdown: { source: string; amount: number }[] = [];
  
  let baseXP = XP_CONFIG.SESSION_COMPLETE;
  breakdown.push({ source: 'Session completion', amount: baseXP });
  
  let multiplier = 1.0;
  if (params.averageScore >= 90) {
    multiplier = XP_CONFIG.SCORE_EXCELLENT;
    breakdown.push({ source: 'Excellent session average', amount: baseXP * (multiplier - 1) });
  } else if (params.averageScore >= 80) {
    multiplier = XP_CONFIG.SCORE_GOOD;
    breakdown.push({ source: 'Good session average', amount: baseXP * (multiplier - 1) });
  }
  
  let bonusXP = 0;
  
  // Consistency bonus (completed all lessons)
  if (params.lessonsInSession > 0) {
    bonusXP += XP_CONFIG.CONSISTENCY_BONUS;
    breakdown.push({ source: 'Completed all lessons', amount: XP_CONFIG.CONSISTENCY_BONUS });
  }
  
  const totalXP = Math.round(baseXP * multiplier + bonusXP);
  
  return {
    baseXP,
    bonusXP,
    totalXP,
    multiplier,
    breakdown,
  };
}

/**
 * Get recommended next lesson based on performance
 */
export function getRecommendedLesson(params: {
  recentScores: number[];
  completedTypes: string[];
  weakAreas: string[];
}): {
  type: 'video' | 'pronunciation' | 'ai-conversation' | 'flashcard';
  reason: string;
} {
  const { recentScores, completedTypes, weakAreas } = params;
  
  // If pronunciation is a weak area, recommend it
  if (weakAreas.includes('pronunciation')) {
    return {
      type: 'pronunciation',
      reason: 'Improve your pronunciation skills',
    };
  }
  
  // If average score is low, recommend video lessons (easier)
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  if (avgScore < 70) {
    return {
      type: 'video',
      reason: 'Build foundational knowledge',
    };
  }
  
  // Recommend variety
  const typeCounts = completedTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const leastPracticed = Object.entries(typeCounts)
    .sort(([, a], [, b]) => a - b)[0]?.[0];
  
  if (leastPracticed) {
    return {
      type: leastPracticed as any,
      reason: 'Practice diverse skills',
    };
  }
  
  // Default to conversation for well-performing students
  return {
    type: 'ai-conversation',
    reason: 'Challenge yourself with conversations',
  };
}

/**
 * Calculate daily goal progress
 */
export function calculateDailyGoal(params: {
  targetXP: number;
  earnedXP: number;
  targetLessons: number;
  completedLessons: number;
  targetTime: number; // minutes
  studyTime: number; // minutes
}): {
  xpProgress: number;
  lessonProgress: number;
  timeProgress: number;
  overallProgress: number;
  completed: boolean;
} {
  const xpProgress = Math.min((params.earnedXP / params.targetXP) * 100, 100);
  const lessonProgress = Math.min((params.completedLessons / params.targetLessons) * 100, 100);
  const timeProgress = Math.min((params.studyTime / params.targetTime) * 100, 100);
  
  const overallProgress = (xpProgress + lessonProgress + timeProgress) / 3;
  const completed = overallProgress >= 100;
  
  return {
    xpProgress,
    lessonProgress,
    timeProgress,
    overallProgress,
    completed,
  };
}
