/**
 * 租户相关类型定义
 */

import { BaseResponse, PaginationInfo } from './common';
import { TenantStatus, PlanType } from '../constants/enums';

// 管理员用户信息
export interface AdminUser {
  id: number;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// 管理员用户请求
export interface AdminUserRequest {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  avatar_url?: string;
}

// 租户数据
export interface TenantData {
  id: number;
  tenant_id: string;
  name: string;
  domain?: string;
  avatar_url?: string;
  status: TenantStatus;
  plan_type: PlanType;
  max_users: number;
  max_storage: number;
  schema_name: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 创建租户请求
export interface TenantCreateRequest {
  name: string;
  domain?: string;
  admin_user: AdminUserRequest;
  plan_type?: PlanType;
  max_users?: number;
  max_storage?: number;
  avatar_url?: string;
  settings?: Record<string, any>;
}

// 更新租户请求
export interface TenantUpdateRequest {
  name?: string;
  domain?: string;
  avatar_url?: string;
  max_users?: number;
  max_storage?: number;
  status?: string;
  settings?: Record<string, any>;
}

// 设置说明
export interface SetupInstructions {
  schema_created: boolean;
  tables_created: boolean;
  admin_account_activated: boolean;
}

// 创建租户响应数据
export interface TenantCreateData {
  tenant: TenantData;
  admin_user: AdminUser;
  setup_instructions: SetupInstructions;
}

// 创建租户响应
export interface TenantCreateResponse extends BaseResponse<TenantCreateData> {}

// 租户响应
export interface TenantResponse extends BaseResponse<TenantData> {}

// 租户列表数据
export interface TenantListData {
  tenants: TenantData[];
  pagination: PaginationInfo;
}

// 租户列表响应
export interface TenantListResponse extends BaseResponse<TenantListData> {}

// 用户统计信息
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
}

// 存储统计信息
export interface StorageStats {
  total_storage: number;
  used_storage: number;
  storage_percentage: number;
}

// API统计信息
export interface ApiStats {
  total_requests: number;
  requests_this_month: number;
  rate_limit: number;
}

// 计费统计信息
export interface BillingStats {
  current_plan: string;
  monthly_cost: number;
  next_billing_date?: string;
}

// 租户统计信息数据
export interface TenantStatsData {
  tenant_id: string;
  user_stats: UserStats;
  storage_stats: StorageStats;
  api_stats: ApiStats;
  billing_stats: BillingStats;
}

// 租户统计信息响应
export interface TenantStatsResponse extends BaseResponse<TenantStatsData> {}

// 租户表单数据
export interface TenantFormData {
  name: string;
  domain: string;
  plan_type: PlanType;
  max_users: number;
  max_storage: number;
  admin_user: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
  };
}

// 租户编辑表单数据
export interface TenantEditFormData {
  name: string;
  domain: string;
  max_users: number;
  max_storage: number;
  settings?: Record<string, any>;
}
