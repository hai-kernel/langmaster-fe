// Curriculum Types

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in days
  items: CurriculumItem[];
  prerequisites: { [itemId: string]: string[] }; // itemId -> prerequisite itemIds
  milestones: Milestone[];
  createdBy: string; // teacherId
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumItem {
  id: string;
  type: 'session' | 'test';
  contentId: string; // sessionId or testId
  title: string;
  order: number;
  isRequired: boolean;
  estimatedTime: number; // in minutes
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requiredItemIds: string[]; // must complete these items to unlock
  xpReward: number;
  badgeId?: string;
  order: number;
}
