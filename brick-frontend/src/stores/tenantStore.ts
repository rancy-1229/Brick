/**
 * 租户状态管理
 */

import { create } from 'zustand';
import { TenantData } from '../types/tenant';
import { tenantApi } from '../services/tenant';
import { TenantListQueryParams } from '../types/common';

interface TenantState {
  // 状态
  currentTenant: TenantData | null;
  tenantList: TenantData[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;

  // 操作
  getCurrentTenant: () => Promise<boolean>;
  getTenantList: (params?: TenantListQueryParams) => Promise<boolean>;
  getTenantDetail: (tenantId: string) => Promise<TenantData | null>;
  updateTenant: (tenantId: string, data: any) => Promise<boolean>;
  deleteTenant: (tenantId: string) => Promise<boolean>;
  searchTenants: (keyword: string, params?: TenantListQueryParams) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentTenant: (tenant: TenantData | null) => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  // 初始状态
  currentTenant: null,
  tenantList: [],
  pagination: {
    page: 1,
    size: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,

  // 获取当前租户
  getCurrentTenant: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tenantApi.getCurrentTenant();
      
      if (response.data) {
        set({
          currentTenant: response.data,
          isLoading: false,
          error: null,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取租户信息失败',
      });
      return false;
    }
  },

  // 获取租户列表
  getTenantList: async (params?: TenantListQueryParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tenantApi.getTenantList(params);
      
      if (response.data) {
        set({
          tenantList: response.data.tenants,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取租户列表失败',
      });
      return false;
    }
  },

  // 获取租户详情
  getTenantDetail: async (tenantId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tenantApi.getTenantDetail(tenantId);
      
      if (response.data) {
        set({
          isLoading: false,
          error: null,
        });
        return response.data;
      }
      
      return null;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取租户详情失败',
      });
      return null;
    }
  },

  // 更新租户
  updateTenant: async (tenantId: string, data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tenantApi.updateTenant(tenantId, data);
      
      if (response.data) {
        // 更新当前租户信息
        const { currentTenant } = get();
        if (currentTenant && currentTenant.tenant_id === tenantId) {
          set({
            currentTenant: response.data,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: null,
          });
        }
        
        // 更新租户列表中的对应项
        const { tenantList } = get();
        const updatedList = tenantList.map(tenant => 
          tenant.tenant_id === tenantId ? response.data : tenant
        ).filter(Boolean) as TenantData[];
        set({ tenantList: updatedList });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '更新租户失败',
      });
      return false;
    }
  },

  // 删除租户
  deleteTenant: async (tenantId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await tenantApi.deleteTenant(tenantId);
      
      // 从租户列表中移除
      const { tenantList } = get();
      const updatedList = tenantList.filter(tenant => tenant.tenant_id !== tenantId);
      set({
        tenantList: updatedList,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '删除租户失败',
      });
      return false;
    }
  },

  // 搜索租户
  searchTenants: async (keyword: string, params?: TenantListQueryParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await tenantApi.searchTenants(keyword, params);
      
      if (response.data) {
        set({
          tenantList: response.data.tenants,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '搜索租户失败',
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

  // 设置当前租户
  setCurrentTenant: (tenant: TenantData | null) => {
    set({ currentTenant: tenant });
  },
}));
