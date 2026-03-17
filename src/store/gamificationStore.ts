import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, Badge } from '@/types';
import {
  calculateLessonXP,
  calculateSessionXP,
  calculateLevelInfo,
  calculateStreakReward,
  generateAchievements,
  XP_CONFIG,
} from '@/services/learningEngine';

interface GamificationState {
  // User stats
  totalXP: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  
  // Lesson stats
  totalLessonsCompleted: number;
  totalSessionsCompleted: number;
  perfectScores: number;
  averageScore: number;
  
  // Activity counters
  pronunciationPractices: number;
  conversationsCompleted: number;
  videosWatched: number;
  flashcardsStudied: number;
  
  // Achievements & Badges
  achievements: Achievement[];
  badges: Badge[];
  unlockedBadges: string[];
  
  // Daily goals
  dailyGoal: {
    targetXP: number;
    earnedXP: number;
    targetLessons: number;
    completedLessons: number;
  };
  
  // Actions
  addLessonXP: (params: {
    lessonType: 'video' | 'pronunciation' | 'ai-conversation' | 'flashcard';
    score: number;
    duration: number;
    targetDuration: number;
    attempts: number;
  }) => number;
  
  addSessionXP: (params: {
    lessonsInSession: number;
    averageScore: number;
    timeSpent: number;
    targetTime: number;
  }) => number;
  
  updateStreak: () => void;
  completeLesson: (score: number, lessonType: string) => void;
  completeSession: () => void;
  unlockAchievement: (achievementId: string) => void;
  unlockBadge: (badge: Badge) => void;
  resetDailyGoal: () => void;
  setDailyGoal: (targetXP: number, targetLessons: number) => void;
  refreshAchievements: () => void;
}

const getToday = () => new Date().toDateString();

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXP: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      
      totalLessonsCompleted: 0,
      totalSessionsCompleted: 0,
      perfectScores: 0,
      averageScore: 0,
      
      pronunciationPractices: 0,
      conversationsCompleted: 0,
      videosWatched: 0,
      flashcardsStudied: 0,
      
      achievements: [],
      badges: [],
      unlockedBadges: [],
      
      dailyGoal: {
        targetXP: 100,
        earnedXP: 0,
        targetLessons: 3,
        completedLessons: 0,
      },

      // Add lesson XP
      addLessonXP: (params) => {
        const state = get();
        const xpCalc = calculateLessonXP({
          ...params,
          streak: state.streak,
        });
        
        const newTotalXP = state.totalXP + xpCalc.totalXP;
        const levelInfo = calculateLevelInfo(newTotalXP);
        
        set({
          totalXP: newTotalXP,
          level: levelInfo.currentLevel,
          dailyGoal: {
            ...state.dailyGoal,
            earnedXP: state.dailyGoal.earnedXP + xpCalc.totalXP,
          },
        });
        
        // Check for level up
        if (levelInfo.currentLevel > state.level) {
          // Trigger level up celebration (you can emit event here)
          console.log('🎉 Level up!', levelInfo.currentLevel);
        }
        
        return xpCalc.totalXP;
      },

      // Add session XP
      addSessionXP: (params) => {
        const state = get();
        const xpCalc = calculateSessionXP(params);
        
        const newTotalXP = state.totalXP + xpCalc.totalXP;
        const levelInfo = calculateLevelInfo(newTotalXP);
        
        set({
          totalXP: newTotalXP,
          level: levelInfo.currentLevel,
          dailyGoal: {
            ...state.dailyGoal,
            earnedXP: state.dailyGoal.earnedXP + xpCalc.totalXP,
          },
        });
        
        return xpCalc.totalXP;
      },

      // Update streak
      updateStreak: () => {
        const state = get();
        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (state.lastActiveDate === today) {
          // Already counted today
          return;
        }
        
        let newStreak = state.streak;
        
        if (state.lastActiveDate === yesterday) {
          // Continue streak
          newStreak += 1;
        } else if (state.lastActiveDate !== today) {
          // Streak broken, start over
          newStreak = 1;
        }
        
        set({
          streak: newStreak,
          lastActiveDate: today,
        });
        
        // Check for streak badges
        const streakReward = calculateStreakReward(newStreak);
        if (streakReward.badge && !state.unlockedBadges.includes(streakReward.badge.id)) {
          get().unlockBadge(streakReward.badge);
        }
      },

      // Complete lesson
      completeLesson: (score, lessonType) => {
        const state = get();
        
        const updates: any = {
          totalLessonsCompleted: state.totalLessonsCompleted + 1,
          dailyGoal: {
            ...state.dailyGoal,
            completedLessons: state.dailyGoal.completedLessons + 1,
          },
        };
        
        // Update type-specific counters
        if (lessonType.includes('pronunciation')) {
          updates.pronunciationPractices = state.pronunciationPractices + 1;
        } else if (lessonType.includes('conversation')) {
          updates.conversationsCompleted = state.conversationsCompleted + 1;
        } else if (lessonType.includes('video')) {
          updates.videosWatched = state.videosWatched + 1;
        } else if (lessonType.includes('flashcard')) {
          updates.flashcardsStudied = state.flashcardsStudied + 1;
        }
        
        // Track perfect scores
        if (score === 100) {
          updates.perfectScores = state.perfectScores + 1;
        }
        
        // Update average score
        const totalScore = state.averageScore * state.totalLessonsCompleted + score;
        updates.averageScore = totalScore / (state.totalLessonsCompleted + 1);
        
        set(updates);
        
        // Refresh achievements
        get().refreshAchievements();
      },

      // Complete session
      completeSession: () => {
        set((state) => ({
          totalSessionsCompleted: state.totalSessionsCompleted + 1,
        }));
        
        // Refresh achievements
        get().refreshAchievements();
      },

      // Unlock achievement
      unlockAchievement: (achievementId) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.completed) return;
        
        const updatedAchievements = state.achievements.map(a =>
          a.id === achievementId ? { ...a, completed: true, progress: a.target } : a
        );
        
        set({
          achievements: updatedAchievements,
          totalXP: state.totalXP + (achievement.xpReward || 0),
        });
        
        console.log('🏆 Achievement unlocked:', achievement.title);
      },

      // Unlock badge
      unlockBadge: (badge) => {
        const state = get();
        
        if (state.unlockedBadges.includes(badge.id)) return;
        
        set({
          badges: [...state.badges, badge],
          unlockedBadges: [...state.unlockedBadges, badge.id],
        });
        
        console.log('🎖️ Badge unlocked:', badge.name);
      },

      // Reset daily goal
      resetDailyGoal: () => {
        const state = get();
        const today = getToday();
        
        if (state.lastActiveDate !== today) {
          set({
            dailyGoal: {
              ...state.dailyGoal,
              earnedXP: 0,
              completedLessons: 0,
            },
          });
        }
      },

      // Set daily goal
      setDailyGoal: (targetXP, targetLessons) => {
        set((state) => ({
          dailyGoal: {
            ...state.dailyGoal,
            targetXP,
            targetLessons,
          },
        }));
      },

      // Refresh achievements
      refreshAchievements: () => {
        const state = get();
        
        const newAchievements = generateAchievements({
          lessonsCompleted: state.totalLessonsCompleted,
          sessionsCompleted: state.totalSessionsCompleted,
          perfectScores: state.perfectScores,
          averageScore: state.averageScore,
          totalXP: state.totalXP,
          streak: state.streak,
          pronunciationPractices: state.pronunciationPractices,
          conversationsCompleted: state.conversationsCompleted,
        });
        
        // Check for newly completed achievements
        newAchievements.forEach(achievement => {
          const existing = state.achievements.find(a => a.id === achievement.id);
          if (!existing && achievement.completed) {
            console.log('🏆 New achievement:', achievement.title);
          }
        });
        
        set({ achievements: newAchievements });
      },
    }),
    {
      name: 'gamification-storage',
    }
  )
);

// Initialize achievements on first load
if (typeof window !== 'undefined') {
  const store = useGamificationStore.getState();
  if (store.achievements.length === 0) {
    store.refreshAchievements();
  }
}
