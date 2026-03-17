/**
 * Axios Configuration with Interceptors
 * Handles automatic token attachment, refresh token logic, and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from './baseUrl';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let logoutInitiated = false;

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function handleLogoutRedirect() {
  if (!logoutInitiated && !window.location.pathname.includes('/login')) {
    logoutInitiated = true;
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    if (state.tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStore = useAuthStore.getState();

      if (!authStore.tokens?.refreshToken) {
        authStore.logout();
        handleLogoutRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
          refreshToken: authStore.tokens.refreshToken,
        });
        const data = response.data?.data;
        const newAccessToken = data?.token;
        const newRefreshToken = data?.refreshToken;
        if (newAccessToken) {
          useAuthStore.getState().updateTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken ?? useAuthStore.getState().tokens?.refreshToken ?? '',
          });
          onTokenRefreshed(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        authStore.logout();
        handleLogoutRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
