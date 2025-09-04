/**
 * 路由配置
 */

import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { TenantRegisterPage } from '../pages/tenant/TenantRegisterPage';
import { TenantListPage } from '../pages/tenant/TenantListPage';
import { TenantDetailPage } from '../pages/tenant/TenantDetailPage';
import { TenantEditPage } from '../pages/tenant/TenantEditPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// 创建根路由
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 首页路由
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Brick 多租户平台</h1>
      <p>欢迎使用 Brick 多租户平台！</p>
      <p>后端 API: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">http://localhost:8000/docs</a></p>
    </div>
  ),
});

// 租户注册路由
const tenantRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tenant/register',
  component: TenantRegisterPage,
});

// 租户列表路由
const tenantListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tenant/list',
  component: TenantListPage,
});

// 租户详情路由
const tenantDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tenant/$tenantId',
  component: TenantDetailPage,
});

// 租户编辑路由
const tenantEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tenant/$tenantId/edit',
  component: TenantEditPage,
});

// 仪表板路由
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// 登录路由
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// 注册路由
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// 用户管理路由
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>用户管理</h1>
      <p>用户管理功能正在开发中...</p>
    </div>
  ),
});

// 用户资料路由
const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/profile',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>个人资料</h1>
      <p>个人资料功能正在开发中...</p>
    </div>
  ),
});

// 用户设置路由
const userSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/settings',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>个人设置</h1>
      <p>个人设置功能正在开发中...</p>
    </div>
  ),
});

// 仪表板用户管理路由
const dashboardUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/users',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>租户用户管理</h1>
      <p>租户用户管理功能正在开发中...</p>
    </div>
  ),
});

// 仪表板设置路由
const dashboardSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/settings',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>租户设置</h1>
      <p>租户设置功能正在开发中...</p>
    </div>
  ),
});

// 404路由
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: () => (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>404 - 页面不存在</h1>
      <p>抱歉，您访问的页面不存在。</p>
    </div>
  ),
});

// 创建路由树
const routeTree = rootRoute.addChildren([
  indexRoute,
  tenantRegisterRoute,
  tenantListRoute,
  tenantDetailRoute,
  tenantEditRoute,
  dashboardRoute,
  loginRoute,
  registerRoute,
  usersRoute,
  userProfileRoute,
  userSettingsRoute,
  dashboardUsersRoute,
  dashboardSettingsRoute,
  notFoundRoute,
]);

// 创建路由器实例
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// 注册路由器类型
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
