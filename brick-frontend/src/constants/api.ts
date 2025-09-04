/**
 * API相关常量
 */

// API基础URL - 开发环境使用相对路径，生产环境使用完整URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API版本
export const API_VERSION = 'v1';

// 完整的API基础路径
export const API_BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;

// 租户相关API端点
export const TENANT_ENDPOINTS = {
  REGISTER: '/tenants/register',
  LIST: '/tenants/',
  DETAIL: (tenantId: string) => `/tenants/${tenantId}`,
  UPDATE: (tenantId: string) => `/tenants/${tenantId}`,
  DELETE: (tenantId: string) => `/tenants/${tenantId}`,
  ME: '/tenants/me',
} as const;

// 用户相关API端点 - 注意：后端目前没有实现认证API
export const USER_ENDPOINTS = {
  LOGIN: '/auth/login', // 暂未实现
  LOGOUT: '/auth/logout', // 暂未实现
  REGISTER: '/auth/register', // 暂未实现
  PROFILE: '/auth/profile', // 暂未实现
  REFRESH: '/auth/refresh', // 暂未实现
} as const;

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000;

// 分页默认配置
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  SIZE: 20,
  MAX_SIZE: 100,
} as const;