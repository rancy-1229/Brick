# Brick Frontend

多租户平台前端应用，基于 React 18 + TypeScript + Vite 构建。

## 技术栈

### 核心框架
- **React 18+**: 用户界面框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite 6**: 快速构建工具和开发服务器

### 状态管理
- **Zustand**: 轻量级状态管理
- **TanStack React Query**: 服务端状态管理和数据获取

### 路由和导航
- **TanStack Router**: 类型安全的路由解决方案

### UI 组件
- **Ant Design 5**: 企业级 UI 组件库
- **ProComponents**: Ant Design 专业组件
- **CSS-in-JS / CSS Modules**: 样式解决方案

### 表单和数据验证
- **React Hook Form**: 高性能表单库
- **Zod**: TypeScript 优先的数据验证

### HTTP 客户端
- **Axios**: HTTP 请求库
- **OpenAPI TypeScript**: 自动生成 API 客户端

### 开发工具
- **Biome**: 代码格式化和 Linting
- **Playwright**: 端到端测试
- **pnpm**: 快速、节省磁盘空间的包管理器

## 项目结构

```
brick-frontend/
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/            # 通用组件
│   │   ├── ui/               # 基础 UI 组件
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   ├── layout/           # 布局组件
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── index.ts
│   │   └── business/         # 业务组件
│   │       ├── TenantCard/
│   │       ├── UserProfile/
│   │       └── index.ts
│   ├── pages/                # 页面组件
│   │   ├── auth/            # 认证相关页面
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── index.ts
│   │   ├── tenant/          # 租户管理页面
│   │   │   ├── List/
│   │   │   ├── Create/
│   │   │   ├── Detail/
│   │   │   └── index.ts
│   │   ├── dashboard/       # 仪表板页面
│   │   │   ├── Overview/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useApi.ts
│   │   └── index.ts
│   ├── services/            # API 服务层
│   │   ├── api/            # API 客户端
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tenant/         # 租户相关 API
│   │   │   ├── tenantApi.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── auth/           # 认证相关 API
│   │   │   ├── authApi.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── stores/             # 状态管理
│   │   ├── authStore.ts    # 认证状态
│   │   ├── tenantStore.ts  # 租户状态
│   │   ├── uiStore.ts      # UI 状态
│   │   └── index.ts
│   ├── types/              # 类型定义
│   │   ├── api.ts          # API 类型
│   │   ├── tenant.ts       # 租户类型
│   │   ├── user.ts         # 用户类型
│   │   ├── common.ts       # 通用类型
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── request.ts      # 请求工具
│   │   ├── storage.ts      # 存储工具
│   │   ├── validation.ts   # 验证工具
│   │   ├── format.ts       # 格式化工具
│   │   └── index.ts
│   ├── constants/          # 常量定义
│   │   ├── api.ts          # API 常量
│   │   ├── routes.ts       # 路由常量
│   │   ├── enums.ts        # 枚举常量
│   │   └── index.ts
│   ├── styles/             # 样式文件
│   │   ├── globals.css     # 全局样式
│   │   ├── variables.css   # CSS 变量
│   │   └── components.css  # 组件样式
│   ├── router/             # 路由配置
│   │   ├── routes.tsx      # 路由定义
│   │   ├── guards.tsx      # 路由守卫
│   │   └── index.tsx
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 应用入口
│   └── vite-env.d.ts       # Vite 类型声明
├── tests/                  # 测试文件
│   ├── e2e/               # 端到端测试
│   ├── unit/              # 单元测试
│   └── fixtures/          # 测试数据
├── docs/                  # 文档
│   ├── api.md             # API 文档
│   ├── components.md      # 组件文档
│   └── deployment.md      # 部署文档
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── biome.json             # Biome 配置
├── playwright.config.ts   # Playwright 配置
└── README.md              # 项目说明
```

## 与后端接口对接

### API 层设计

#### 1. API 客户端配置
```typescript
// src/services/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

#### 2. 租户 API 服务
```typescript
// src/services/tenant/tenantApi.ts
import { apiClient } from '../api/client';
import type { 
  TenantCreateRequest, 
  TenantCreateResponse,
  TenantResponse,
  TenantListResponse 
} from './types';

export const tenantApi = {
  // 租户注册
  register: (data: TenantCreateRequest): Promise<TenantCreateResponse> =>
    apiClient.post('/tenants/register', data),
  
  // 获取当前租户信息
  getCurrent: (): Promise<TenantResponse> =>
    apiClient.get('/tenants/me'),
  
  // 获取租户列表（管理员）
  list: (params: {
    page?: number;
    size?: number;
    status?: string;
    plan_type?: string;
    search?: string;
  }): Promise<TenantListResponse> =>
    apiClient.get('/tenants', { params }),
  
  // 获取指定租户信息
  getById: (tenantId: string): Promise<TenantResponse> =>
    apiClient.get(`/tenants/${tenantId}`),
  
  // 更新租户信息
  update: (tenantId: string, data: any): Promise<TenantResponse> =>
    apiClient.put(`/tenants/${tenantId}`, data),
  
  // 删除租户
  delete: (tenantId: string): Promise<void> =>
    apiClient.delete(`/tenants/${tenantId}`),
};
```

### 状态管理设计

#### 1. 认证状态管理
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        // 实现登录逻辑
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
```

#### 2. 租户状态管理
```typescript
// src/stores/tenantStore.ts
import { create } from 'zustand';
import { tenantApi } from '@/services/tenant';

interface TenantState {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentTenant: (tenant: Tenant) => void;
  fetchCurrentTenant: () => Promise<void>;
  fetchTenants: (params?: any) => Promise<void>;
  createTenant: (data: TenantCreateRequest) => Promise<void>;
  clearError: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: null,
  tenants: [],
  loading: false,
  error: null,
  
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  
  fetchCurrentTenant: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tenantApi.getCurrent();
      set({ currentTenant: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTenants: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await tenantApi.list(params);
      set({ tenants: response.data.tenants, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTenant: async (data) => {
    set({ loading: true, error: null });
    try {
      await tenantApi.register(data);
      await get().fetchTenants(); // 刷新列表
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));
```

### 数据流设计

#### 1. 组件数据流
```
用户操作 → 组件事件 → Store Action → API 调用 → 后端处理 → 响应数据 → Store 更新 → 组件重新渲染
```

#### 2. 路由守卫
```typescript
// src/router/guards.tsx
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from '@tanstack/react-router';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return <>{children}</>;
};

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};
```

## 开发步骤

### 1. 环境准备
```bash
# 确保已安装 Node.js 18+ 和 pnpm
node --version
pnpm --version

# 如果没有安装 pnpm
npm install -g pnpm
```

### 2. 项目初始化
```bash
# 进入前端目录
cd brick-frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 3. 开发工作流
```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 4. 与后端联调
```bash
# 确保后端服务运行在 http://localhost:8000
# 前端服务运行在 http://localhost:5173

# 测试 API 连接
curl http://localhost:8000/health
```

## 部署

### 开发环境
- 前端: `http://localhost:5173`
- 后端: `http://localhost:8000`

### 生产环境
- 前端: 构建静态文件，部署到 CDN 或静态服务器
- 后端: 部署到云服务器或容器平台
- 数据库: PostgreSQL 数据库

## 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用函数式组件 + Hooks
- 使用 Zod 进行数据验证

### 提交规范
- 使用 Conventional Commits 格式
- 提交前运行 `pnpm lint` 和 `pnpm type-check`
- 重要功能需要编写测试用例

### 文档规范
- 组件需要 JSDoc 注释
- API 接口需要类型定义
- 复杂逻辑需要代码注释

## 许可证

MIT License