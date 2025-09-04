/**
 * 路由常量
 */

// 路由路径
export const ROUTES = {
  // 公共路由
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // 租户相关路由
  TENANT_REGISTER: '/tenant/register',
  TENANT_LIST: '/tenant/list',
  TENANT_DETAIL: (tenantId: string) => `/tenant/${tenantId}`,
  TENANT_EDIT: (tenantId: string) => `/tenant/${tenantId}/edit`,
  
  // 仪表板路由
  DASHBOARD: '/dashboard',
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  DASHBOARD_USERS: '/dashboard/users',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  
  // 用户管理路由
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_SETTINGS: '/users/settings',
  
  // 错误页面
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
} as const;

// 路由元信息
export const ROUTE_META = {
  [ROUTES.HOME]: { title: '首页', requiresAuth: false },
  [ROUTES.LOGIN]: { title: '登录', requiresAuth: false },
  [ROUTES.REGISTER]: { title: '注册', requiresAuth: false },
  [ROUTES.TENANT_REGISTER]: { title: '租户注册', requiresAuth: false },
  [ROUTES.TENANT_LIST]: { title: '租户列表', requiresAuth: true, role: 'super_admin' },
  [ROUTES.DASHBOARD]: { title: '仪表板', requiresAuth: true },
  [ROUTES.DASHBOARD_OVERVIEW]: { title: '概览', requiresAuth: true },
  [ROUTES.DASHBOARD_USERS]: { title: '用户管理', requiresAuth: true },
  [ROUTES.DASHBOARD_SETTINGS]: { title: '设置', requiresAuth: true },
  [ROUTES.USERS]: { title: '用户管理', requiresAuth: true },
  [ROUTES.USER_PROFILE]: { title: '个人资料', requiresAuth: true },
  [ROUTES.USER_SETTINGS]: { title: '个人设置', requiresAuth: true },
  [ROUTES.NOT_FOUND]: { title: '页面不存在', requiresAuth: false },
  [ROUTES.UNAUTHORIZED]: { title: '无权限访问', requiresAuth: false },
  [ROUTES.SERVER_ERROR]: { title: '服务器错误', requiresAuth: false },
} as const;