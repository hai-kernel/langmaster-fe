// Authentication and Authorization Types

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];
  // Student specific
  level?: number;
  xp?: number;
  streak?: number;
  totalLessonsCompleted?: number;
  faceIdEnrolled?: boolean;
  enrolledClasses?: string[]; // IDs of classes the student is enrolled in
  // Teacher specific
  teachingSubjects?: string[];
  // Admin specific
  isSuperAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}