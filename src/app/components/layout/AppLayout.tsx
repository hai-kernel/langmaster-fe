import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export function AppLayout() {
  const { user } = useAuthStore();
  const backgroundColor = useThemeStore((s) => s.backgroundColor);

  if (!user) {
    return <Outlet />;
  }

  return (
    <div
      className="min-h-screen"
      data-theme-bg={backgroundColor}
      style={{ backgroundColor: 'var(--page-bg, #f8fafc)' }}
    >
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-violet-500/[0.04] via-transparent to-emerald-500/[0.03] dark:from-violet-500/[0.06] dark:to-emerald-500/[0.04]" aria-hidden />
      <div className="hidden md:flex h-screen relative">
        <Sidebar />
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{ backgroundColor: 'var(--page-bg)' }}
        >
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative" style={{ backgroundColor: 'var(--page-bg)' }}>
            <Outlet />
          </main>
        </div>
      </div>

      <div className="md:hidden flex flex-col min-h-screen relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-20 relative" style={{ backgroundColor: 'var(--page-bg)' }}>
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
