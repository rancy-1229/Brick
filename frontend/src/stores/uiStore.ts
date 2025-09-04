/**
 * UI状态管理
 */

import { create } from 'zustand';

interface UIState {
  // 布局状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  
  // 全局状态
  globalLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  
  // 操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
  setGlobalLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // 初始状态
  sidebarCollapsed: false,
  theme: 'light',
  language: 'zh-CN',
  globalLoading: false,
  notifications: [],

  // 切换侧边栏
  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  },

  // 设置侧边栏状态
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  // 设置主题
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // 可以在这里添加主题切换的逻辑
    document.documentElement.setAttribute('data-theme', theme);
  },

  // 设置语言
  setLanguage: (language: 'zh-CN' | 'en-US') => {
    set({ language });
    // 可以在这里添加国际化切换的逻辑
  },

  // 设置全局加载状态
  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  },

  // 添加通知
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // 自动移除通知
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  // 移除通知
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  // 清除所有通知
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
