/**
 * 枚举常量
 */

// 租户状态
export enum TenantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

// 租户套餐类型
export enum PlanType {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

// 用户角色
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user',
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

// 租户状态显示文本
export const TENANT_STATUS_LABELS = {
  [TenantStatus.PENDING]: '待审核',
  [TenantStatus.ACTIVE]: '正常',
  [TenantStatus.SUSPENDED]: '已暂停',
  [TenantStatus.INACTIVE]: '已停用',
} as const;

// 套餐类型显示文本
export const PLAN_TYPE_LABELS = {
  [PlanType.BASIC]: '基础版',
  [PlanType.PRO]: '专业版',
  [PlanType.ENTERPRISE]: '企业版',
} as const;

// 用户角色显示文本
export const USER_ROLE_LABELS = {
  [UserRole.SUPER_ADMIN]: '超级管理员',
  [UserRole.TENANT_ADMIN]: '租户管理员',
  [UserRole.USER]: '普通用户',
} as const;

// 用户状态显示文本
export const USER_STATUS_LABELS = {
  [UserStatus.ACTIVE]: '正常',
  [UserStatus.INACTIVE]: '已停用',
  [UserStatus.PENDING]: '待激活',
  [UserStatus.SUSPENDED]: '已暂停',
} as const;