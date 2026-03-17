import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

// Global shortcuts configuration
export const GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Search',
    action: () => {
      // Trigger search modal
      const searchBtn = document.querySelector('[data-search-trigger]') as HTMLElement;
      searchBtn?.click();
    }
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    preventDefault: true
  },
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    action: () => {
      toast.info('Keyboard Shortcuts', {
        description: 'Ctrl+K: Search, G+H: Home, G+S: Sessions, G+P: Profile, Esc: Close modal'
      });
    }
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog',
    action: () => {
      // Close any open dialogs
      const closeButtons = document.querySelectorAll('[data-dialog-close], [data-modal-close]');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLElement).click();
      }
    }
  }
];

// Navigation shortcuts (using 'g' as prefix, like GitHub)
export function useNavigationShortcuts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Handle 'g' prefix for navigation
      if (e.key === 'g' && !gPressed) {
        gPressed = true;
        // Reset after 1 second
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimeout);

        switch (e.key) {
          case 'h':
            navigate('/');
            toast.success('Navigated to Home');
            break;
          case 's':
            navigate('/sessions');
            toast.success('Navigated to Sessions');
            break;
          case 'p':
            navigate('/profile');
            toast.success('Navigated to Profile');
            break;
          case 'v':
            navigate('/vocabulary');
            toast.success('Navigated to Vocabulary');
            break;
          case 't':
            navigate('/tests');
            toast.success('Navigated to Tests');
            break;
          case 'a':
            navigate('/achievements');
            toast.success('Navigated to Achievements');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [navigate]);
}

// Custom keyboard shortcut hook
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = options.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const matchesShift = options.shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = options.alt ? e.altKey : !e.altKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        if (options.preventDefault) {
          e.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

// Lesson shortcuts
export function useLessonShortcuts(callbacks: {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onSkip?: () => void;
  onPlayPause?: () => void;
}) {
  // Next: Arrow Right or N
  useKeyboardShortcut('ArrowRight', () => callbacks.onNext?.());
  useKeyboardShortcut('n', () => callbacks.onNext?.());

  // Previous: Arrow Left or P
  useKeyboardShortcut('ArrowLeft', () => callbacks.onPrevious?.());
  useKeyboardShortcut('p', () => callbacks.onPrevious?.());

  // Submit: Enter (with Ctrl)
  useKeyboardShortcut('Enter', () => callbacks.onSubmit?.(), { ctrl: true });

  // Skip: S
  useKeyboardShortcut('s', () => callbacks.onSkip?.());

  // Play/Pause: Space
  useKeyboardShortcut(' ', () => callbacks.onPlayPause?.(), { preventDefault: true });
}

// Modal shortcuts
export function useModalShortcuts(callbacks: {
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  // Close: Escape
  useKeyboardShortcut('Escape', () => callbacks.onClose?.());

  // Confirm: Enter
  useKeyboardShortcut('Enter', () => callbacks.onConfirm?.());

  // Cancel: Escape (same as close)
  useKeyboardShortcut('Escape', () => callbacks.onCancel?.());
}

// Teacher shortcuts
export function useTeacherShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let tPressed = false;
    let tTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 't' && !tPressed) {
        tPressed = true;
        tTimeout = setTimeout(() => {
          tPressed = false;
        }, 1000);
        return;
      }

      if (tPressed) {
        tPressed = false;
        clearTimeout(tTimeout);

        switch (e.key) {
          case 'd':
            navigate('/teacher');
            toast.success('Navigated to Dashboard');
            break;
          case 's':
            navigate('/teacher/students');
            toast.success('Navigated to Students');
            break;
          case 'c':
            navigate('/teacher/classes');
            toast.success('Navigated to Classes');
            break;
          case 'l':
            navigate('/teacher/content-library');
            toast.success('Navigated to Content Library');
            break;
          case 'g':
            navigate('/teacher/grading-center');
            toast.success('Navigated to Grading Center');
            break;
          case 'a':
            navigate('/teacher/analytics');
            toast.success('Navigated to Analytics');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(tTimeout);
    };
  }, [navigate]);
}

// Admin shortcuts
export function useAdminShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let aPressed = false;
    let aTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'a' && !aPressed && e.ctrlKey) {
        e.preventDefault();
        aPressed = true;
        aTimeout = setTimeout(() => {
          aPressed = false;
        }, 1000);
        return;
      }

      if (aPressed) {
        aPressed = false;
        clearTimeout(aTimeout);

        switch (e.key) {
          case 'd':
            navigate('/admin');
            toast.success('Navigated to Dashboard');
            break;
          case 'u':
            navigate('/admin/users');
            toast.success('Navigated to Users');
            break;
          case 'c':
            navigate('/admin/content');
            toast.success('Navigated to Content');
            break;
          case 'a':
            navigate('/admin/analytics');
            toast.success('Navigated to Analytics');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(aTimeout);
    };
  }, [navigate]);
}
