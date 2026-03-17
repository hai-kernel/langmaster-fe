import { useEffect } from 'react';
import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

// This component must be inside the Router context
export function RouterSetup() {
  // Initialize keyboard shortcuts (needs Router context)
  useNavigationShortcuts();

  return null;
}
