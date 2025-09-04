/**
 * 用户相关类型定义
 */

import { BaseResponse } from './common';
import { UserRole, UserStatus } from '../constants/enums';

// 用户数据
export interface UserData {
  id: number;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  tenant_id?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

// 用户登录请求
export interface UserLoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// 用户注册请求
export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
}

// 用户登录响应
export interface UserLoginResponse extends BaseResponse<{
  user: UserData;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {}

// 用户注册响应
export interface UserRegisterResponse extends BaseResponse<UserData> {}

// 用户信息响应
export interface UserProfileResponse extends BaseResponse<UserData> {}

// 更新用户信息请求
export interface UserUpdateRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// 用户表单数据
export interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

// 用户编辑表单数据
export interface UserEditFormData {
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

// 用户统计信息
export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

// 用户活动日志
export interface UserActivityLog {
  id: number;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// 用户会话信息
export interface UserSession {
  user: UserData;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  permissions: string[];
}
