# 🎓 English AI - Ứng dụng học tiếng Anh với AI chấm phát âm

Ứng dụng học tiếng Anh hiện đại tập trung vào Listening, Speaking và Pronunciation với AI phân tích và chấm điểm phát âm.

## ✨ Tính năng chính

### 🏠 Dashboard
- Hiển thị tiến độ học tập
- Gamification: Level, XP, Streak
- Tiếp tục bài học gần nhất
- Quick actions đến các phần khác

### 📚 Lộ trình học (Session → Lesson)
- **Sessions**: Các chủ đề học (Beginner, Intermediate, Advanced)
- **Lessons**: 4 loại bài học
  - 📹 Video hội thoại
  - 🎙 Luyện phát âm
  - 🤖 Hội thoại với AI
  - 🧠 Flashcard từ vựng

### 🎯 Gamification
- Level & XP system
- Chuỗi ngày học liên tục (Streak)
- Huy hiệu (Badges)
- Thành tích (Achievements)

### 📖 Từ vựng
- Flashcard lật tương tác
- Ôn tập từ đã học
- Phát âm và ví dụ

### 👤 Hồ sơ
- Thông tin người dùng
- Tổng quan thành tích
- Danh sách huy hiệu
- Theo dõi tiến độ

## 🏗️ Kiến trúc Frontend

### Cấu trúc thư mục (Feature-based Architecture)

\`\`\`
src/
├── app/
│   ├── App.tsx                    # Main app với routing
│   └── components/
│       ├── ui/                    # shadcn/ui components
│       └── figma/                 # Protected Figma components
├── features/                      # Feature modules
│   ├── session/
│   │   ├── SessionCard.tsx        # Card hiển thị session
│   │   ├── SessionOverview.tsx    # Danh sách sessions
│   │   └── SessionDetail.tsx      # Chi tiết session + lessons
│   ├── lesson/
│   │   └── LessonItem.tsx         # Item hiển thị lesson
│   ├── gamification/
│   │   └── GamificationBar.tsx    # XP, Level, Streak bar
│   ├── vocabulary/
│   │   └── VocabularyScreen.tsx   # Màn hình flashcard
│   └── user/
│       ├── Dashboard.tsx          # Home screen
│       └── ProfileScreen.tsx      # Profile & achievements
├── shared/                        # Shared components
│   └── ui/
│       ├── ProgressBar.tsx        # Progress bar component
│       └── LevelBadge.tsx         # Badge hiển thị level
├── services/
│   └── mockData.ts                # Mock data & helper functions
├── store/
│   └── appStore.ts                # Zustand global state
├── types/
│   └── index.ts                   # TypeScript types & interfaces
└── styles/                        # Global styles
\`\`\`

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Zustand** - State management
- **Motion** (Framer Motion) - Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible components (via shadcn/ui)

## 🎨 Design System

### Màu sắc
- **Primary**: Blue (#3B82F6) → Công nghệ, AI
- **Secondary**: Purple (#A855F7) → Sáng tạo
- **Success**: Green (#22C55E) → Đúng
- **Error**: Red (#EF4444) → Sai
- **Warning**: Orange (#F97316) → Chú ý

### Phong cách
- Trẻ trung, thân thiện
- Bo góc lớn (rounded-lg, rounded-full)
- Gradient backgrounds
- Smooth animations
- Dark mode support

## 🔄 Data Flow

### State Management (Zustand)
\`\`\`typescript
useAppStore:
  - user: User                    # Thông tin user
  - userProgress: UserProgress    # Tiến độ học
  - sessions: Session[]           # Danh sách sessions
  - lessons: Lesson[]             # Danh sách lessons
  - currentView: string           # Routing state
  - selectedSessionId: string     # Session đang xem
  - selectedLessonId: string      # Lesson đang làm
\`\`\`

### Routing
Simple client-side routing dựa trên `currentView` state:
- `home` → Dashboard
- `sessions` → Session Overview
- `session-detail` → Session Detail
- `lesson` → Lesson Screen (placeholder)
- `vocabulary` → Vocabulary Screen
- `profile` → Profile Screen

## 📱 Responsive Design

- **Mobile-first** approach
- Breakpoints:
  - `sm:` 640px - Tablet
  - `lg:` 1024px - Desktop
- Grid layouts tự động điều chỉnh
- Hidden elements trên mobile (text trong nav)

## 🚀 Mở rộng trong tương lai

### Backend Integration
- Kết nối với API AI chấm phát âm thực tế
- Lưu trữ tiến độ người dùng
- Authentication & User management

### Tính năng mới
- ✅ Video Lesson screen với subtitle tương tác
- ✅ Pronunciation Practice với audio recorder
- ✅ AI Coach feedback thông minh
- ✅ Multiplayer & Social features
- ✅ Leaderboard & Competitions

### Performance
- Code splitting per feature
- Lazy loading cho lessons
- Image optimization
- PWA support

## 🎯 Best Practices

### Component Organization
- Feature-based structure
- Small, reusable components
- Clear separation of concerns

### Type Safety
- Strict TypeScript
- Shared types in `/types`
- No `any` types

### State Management
- Global state với Zustand
- Local state với React hooks
- Derived state từ global state

### Styling
- Tailwind utility classes
- Consistent design tokens
- shadcn/ui components

## 📖 Hướng dẫn phát triển

### Thêm feature mới
1. Tạo folder trong `/src/features/[feature-name]`
2. Tạo components cần thiết
3. Export từ index file
4. Import và sử dụng trong App.tsx

### Thêm screen mới
1. Tạo component trong feature folder
2. Thêm route mới trong `currentView` state
3. Thêm case trong `renderView()` function
4. Thêm navigation button nếu cần

---

**Phong cách**: Duolingo meets ELSA Speak  
**Mục tiêu**: Học tiếng Anh vui vẻ, hiệu quả với AI  
**Đối tượng**: Học sinh, sinh viên, người đi làm
