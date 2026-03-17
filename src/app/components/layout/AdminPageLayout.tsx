import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  /** Optional stats: [{ label, value }] shown as compact chips */
  stats?: { label: string; value: string | number }[];
  children: ReactNode;
  /** If true, use max-w-7xl container with padding (default true) */
  container?: boolean;
}

/**
 * Compact admin page wrapper: theme-aware background, minimal header, optional stats.
 * Use for consistent UX across admin flows.
 */
export function AdminPageLayout({
  title,
  subtitle,
  icon: Icon,
  action,
  stats,
  children,
  container = true,
}: AdminPageLayoutProps) {
  return (
    <div className="min-h-[60vh] bg-[var(--page-bg)] pb-6 md:pb-8">
      <div className={container ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : 'py-6'}>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
              {Icon && <Icon className="h-6 w-6 text-primary" />}
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card px-4 py-2 text-card-foreground"
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="block text-lg font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
