import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Bell, LogOut, Settings, User as UserIcon, ChevronDown, Search, Flame, Star, Trophy } from 'lucide-react';
import { ThemeColorBar } from './ThemeColorBar';
import { Progress } from '@/app/components/ui/progress';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const isSessionPage = location.pathname === '/sessions' || /^\/sessions\/\d+$/.test(location.pathname);
  const showGamification = user?.role === 'student' && isSessionPage;

  const appUser = useAppStore((s) => s.user);
  const level = appUser?.level ?? user?.level ?? 1;
  const xp = appUser?.xp ?? 0;
  const streak = appUser?.streak ?? 0;
  const xpForNext = (level + 1) * 250;
  const xpProgress = xpForNext > 0 ? ((xp % 250) / 250) * 100 : 0;

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/sessions?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-sm"
      style={{ backgroundColor: 'var(--header-bg, rgba(255,255,255,0.95))' }}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Logo (mobile only) */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm">
              E
            </div>
            <span className="font-semibold text-slate-900 dark:text-white truncate">English AI</span>
          </Link>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-2 sm:mx-4 hidden sm:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Tìm bài học, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-violet-500"
            />
          </div>
        </form>

        {/* Right: Stats group + Theme + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Stats: Level, XP, Streak - subtle icons */}
          {user.role === 'student' && (
            <div className="hidden md:flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-700">
              <Link
                to="/progress"
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                title="Level"
              >
                <Trophy className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-semibold">{level}</span>
              </Link>
              <Link
                to="/progress"
                className="flex items-center gap-1.5 min-w-[72px]"
                title="XP"
              >
                <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Progress value={xpProgress} className="h-1 w-12 rounded-full" />
                </div>
              </Link>
              <Link
                to="/achievements"
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                title="Chuỗi"
              >
                <Flame className={`h-4 w-4 ${streak > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-sm font-semibold">{streak}</span>
              </Link>
            </div>
          )}

          <ThemeColorBar />

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Thông báo"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0f1115]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 pl-2 pr-3 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border-0"
              >
                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-violet-500 text-white text-base font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200 dark:border-slate-700">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer">
                <UserIcon className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg cursor-pointer">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
