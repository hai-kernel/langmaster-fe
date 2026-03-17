import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Home,
  BookOpen,
  Book,
  User,
  GraduationCap,
  Users,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Database,
  Bell,
  Award,
  Calendar,
  Sparkles,
  Target,
  ClipboardList,
  ListOrdered,
  Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const studentNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Learning', href: '/sessions', icon: BookOpen },
    { title: 'Vocabulary', href: '/vocabulary', icon: Book },
    { title: 'Tests', href: '/tests', icon: FileText },
    { title: 'Progress', href: '/progress', icon: BarChart3 },
    { title: 'Achievements', href: '/achievements', icon: Award },
    { title: 'Profile', href: '/profile', icon: User },
  ];

  const teacherNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/teacher', icon: Home },
    { title: 'My Students', href: '/teacher/students', icon: Users },
    { title: 'My Classes', href: '/teacher/classes', icon: GraduationCap },
    { title: 'Content Library', href: '/teacher/lessons', icon: BookOpen },
    { title: 'Grading Center', href: '/teacher/grading-center', icon: ClipboardList },
    { title: 'Create Lesson', href: '/teacher/create-lesson', icon: Sparkles },
    { title: 'Create Test', href: '/teacher/create-test', icon: FileText },
    { title: 'Curriculum', href: '/teacher/curriculum', icon: Book },
    { title: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
    { title: 'Schedule', href: '/teacher/schedule', icon: Calendar },
  ];

  const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: Home },
    // Cấu trúc học: Course → Topic → Session → Lesson/Content
    { title: 'Lộ trình học (Courses)', href: '/admin/curriculum', icon: ListOrdered },
    { title: 'Chủ đề học (Topics)', href: '/admin/topics', icon: Target },
    { title: 'Buổi học (Sessions)', href: '/admin/sessions', icon: Layers },
    { title: 'Nội dung & Bài học', href: '/admin/content', icon: BookOpen },
    // Đánh giá & lớp học
    { title: 'Bài test', href: '/admin/tests', icon: FileText },
    { title: 'Lớp học', href: '/admin/classes', icon: GraduationCap },
    // Người dùng & hệ thống
    { title: 'Người dùng', href: '/admin/users', icon: Users },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'AI Usage', href: '/admin/ai-usage', icon: Sparkles },
    { title: 'Face ID', href: '/admin/face-id', icon: Shield },
    { title: 'Notifications', href: '/admin/notifications', icon: Bell },
    { title: 'System', href: '/admin/settings', icon: Database },
  ];

  const navItems =
    user.role === 'student' ? studentNavItems :
    user.role === 'teacher' ? teacherNavItems :
    adminNavItems;

  const roleGradient = {
    student: 'from-emerald-500 to-teal-600',
    teacher: 'from-violet-500 to-purple-600',
    admin: 'from-rose-500 to-red-600',
  };

  return (
    <aside
      className="w-[252px] flex-shrink-0 flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 shadow-sm"
      style={{ backgroundColor: 'var(--sidebar-bg, #F8F9FA)' }}
    >
      {/* Logo */}
      <div
        className="h-[72px] flex items-center px-5 border-b border-slate-200/80 dark:border-slate-800/80"
        style={{ backgroundColor: 'var(--sidebar-bg, #F8F9FA)' }}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${roleGradient[user.role]} text-white font-bold text-lg shadow-lg shadow-black/10 transition-transform group-hover:scale-105`}>
            E
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold text-slate-900 dark:text-white truncate">English AI</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user.role}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea
        className="flex-1 py-4"
        style={{ backgroundColor: 'var(--sidebar-bg, #F8F9FA)' }}
      >
        <nav className="px-3 space-y-1" aria-label="Main">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link key={item.href} to={item.href} className="block mx-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-11 px-4 rounded-r-xl font-medium transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'bg-primary/8 text-primary border-l-primary hover:bg-primary/12'
                      : 'border-l-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`}
                    strokeWidth={isActive ? 2.25 : 1.5}
                  />
                  <span className="truncate text-sm">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Settings */}
      <div
        className="p-3 border-t border-slate-200/80 dark:border-slate-800/80"
        style={{ backgroundColor: 'var(--sidebar-bg, #F8F9FA)' }}
      >
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          System
        </p>
        <Link to={user.role === 'teacher' ? '/teacher/settings' : user.role === 'admin' ? '/admin/settings' : '/settings'} className="block mx-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
