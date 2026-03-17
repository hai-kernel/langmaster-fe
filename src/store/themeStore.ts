import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BackgroundColorKey =
  | 'slate'
  | 'warm'
  | 'blue'
  | 'green'
  | 'violet'
  | 'rose'
  | 'dark';

export const BACKGROUND_OPTIONS: Record<
  BackgroundColorKey,
  { label: string; light: string; dark: string }
> = {
  slate: {
    label: 'Slate',
    light: '#f8fafc',
    dark: '#0f1115',
  },
  warm: {
    label: 'Ấm',
    light: '#fef7ed',
    dark: '#1c1917',
  },
  blue: {
    label: 'Xanh dương',
    light: '#f0f9ff',
    dark: '#0c1929',
  },
  green: {
    label: 'Xanh lá',
    light: '#f0fdf4',
    dark: '#0d1f12',
  },
  violet: {
    label: 'Tím',
    light: '#faf5ff',
    dark: '#1a1625',
  },
  rose: {
    label: 'Hồng',
    light: '#fff1f2',
    dark: '#1f1315',
  },
  dark: {
    label: 'Tối',
    light: '#e2e8f0',
    dark: '#0a0a0b',
  },
};

interface ThemeState {
  backgroundColor: BackgroundColorKey;
  setBackgroundColor: (key: BackgroundColorKey) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      backgroundColor: 'slate',
      setBackgroundColor: (key) => set({ backgroundColor: key }),
    }),
    { name: 'theme-background' }
  )
);
