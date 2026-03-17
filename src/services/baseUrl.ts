// API Base URL - Single source of truth
const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_API_BASE_URL;

function normalizeApiBaseUrl(input: string | undefined): string {
  const fallback = '/api';
  if (!input) return fallback;
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

// Dev: prefer explicit env (avoid Vite proxy mismatch); fallback to '/api' for proxy-based dev.
export const API_BASE_URL = isDev
  ? (envUrl ? normalizeApiBaseUrl(envUrl) : '/api')
  : normalizeApiBaseUrl(envUrl);
