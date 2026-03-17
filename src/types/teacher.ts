// Teacher-specific Types

export interface Class {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  curriculumId?: string;
  startDate: Date;
  endDate?: Date;
  schedule?: ClassSchedule;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSchedule {
  daysOfWeek: number[]; // 0-6 (Sun-Sat)
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  timezone: string;
}

export interface TeacherContent {
  sessions: string[];
  lessons: string[];
  tests: string[];
  curricula: string[];
}

export interface ClassProgress {
  classId: string;
  overallCompletion: number; // percentage
  studentsProgress: StudentClassProgress[];
  averageScore: number;
}

export interface StudentClassProgress {
  studentId: string;
  studentName: string;
  completion: number;
  averageScore: number;
  lastActive: Date;
}
