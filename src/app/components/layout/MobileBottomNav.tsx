import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  FileText,
  Award,
  User,
  Users,
  BarChart3,
  Sparkles,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const studentNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'Sessions', href: '/sessions', icon: BookOpen },
    { title: 'Tests', href: '/tests', icon: FileText },
    { title: 'Rewards', href: '/achievements', icon: Award },
    { title: 'Profile', href: '/profile', icon: User },
  ];

  const teacherNavItems: NavItem[] = [
    { title: 'Home', href: '/teacher', icon: Home },
    { title: 'Students', href: '/teacher/students', icon: Users },
    { title: 'Classes', href: '/teacher/classes', icon: BookOpen },
    { title: 'Create', href: '/teacher/create-lesson', icon: Sparkles },
    { title: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
  ];

  const adminNavItems: NavItem[] = [
    { title: 'Home', href: '/admin', icon: Home },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Content', href: '/admin/content', icon: BookOpen },
    { title: 'System', href: '/admin/settings', icon: Shield },
  ];

  const navItems = 
    user.role === 'student' ? studentNavItems :
    user.role === 'teacher' ? teacherNavItems :
    adminNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-green-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500'
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}