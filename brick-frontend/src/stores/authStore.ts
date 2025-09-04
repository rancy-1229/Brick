/**
 * 认证状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData, UserSession } from '../types/user';
import { authApi } from '../services/auth';

interface AuthState {
  // 状态
  user: UserData | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: any) => Promise<boolean>;
  changePassword: (data: any) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (email: string, password: string, remember = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password, remember });
          
          if (response.data) {
            const { user, access_token, refresh_token, expires_in } = response.data;
            
            const session: UserSession = {
              user,
              access_token,
              refresh_token,
              expires_at: Date.now() + expires_in * 1000,
              permissions: [], // TODO: 从响应中获取权限
            };

            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          }
          
          return false;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '登录失败',
          });
          return false;
        }
      },

      // 登出
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logout();
        } catch (error) {
          console.error('登出失败:', error);
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // 注册
      register: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          
          if (response.data) {
            set({
              isLoading: false,
              error: null,
            });
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '注册失败',
          });
          return false;
        }
      },

      // 刷新token
      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          
          if (response.access_token) {
            const { session } = get();
            if (session) {
              const updatedSession: UserSession = {
                ...session,
                access_token: response.access_token,
                refresh_token: response.refresh_token,
                expires_at: Date.now() + 3600 * 1000, // 1小时
              };

              set({
                session: updatedSession,
                isAuthenticated: true,
              });
            }
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('刷新token失败:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // 更新用户资料
      updateProfile: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.updateUserProfile(data);
          
          if (response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null,
            });
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '更新资料失败',
          });
          return false;
        }
      },

      // 修改密码
      changePassword: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.changePassword(data);
          
          set({
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '修改密码失败',
          });
          return false;
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
