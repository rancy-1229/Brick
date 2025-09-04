# Brick 多租户平台

一个基于PostgreSQL Schema隔离的多租户平台，包含前端和后端两个部分。

## 项目结构

```
Brick/
├── brick-backend/          # 后端项目 (FastAPI + PostgreSQL)
│   ├── app/               # 应用代码
│   │   ├── api/           # API接口
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务逻辑
│   │   ├── schemas/       # 数据验证
│   │   └── core/          # 核心功能
│   ├── docs/              # 文档
│   └── main.py            # 主入口
└── brick-frontend/        # 前端项目 (React + TypeScript + Vite)
    ├── src/
    │   ├── components/    # 组件
    │   ├── pages/         # 页面
    │   ├── services/      # API服务
    │   ├── stores/        # 状态管理
    │   ├── types/         # 类型定义
    │   └── utils/         # 工具函数
    └── index.html         # 入口HTML
```

## 功能特性

### 后端功能
- ✅ 租户注册和管理
- ✅ 基于PostgreSQL Schema的多租户隔离
- ✅ 用户管理
- ✅ 角色权限系统
- ⚠️ 认证系统（开发中）

### 前端功能
- ✅ 租户注册页面
- ✅ 用户注册页面
- ✅ 登录页面
- ✅ 响应式布局
- ✅ 状态管理（Zustand）
- ✅ 路由系统（TanStack Router）
- ✅ UI组件库（Ant Design）

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **认证**: JWT (计划中)
- **文档**: Swagger/OpenAPI

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **UI库**: Ant Design
- **路由**: TanStack Router
- **状态管理**: Zustand
- **HTTP客户端**: Axios

## 快速开始

### 后端启动

```bash
cd brick-backend
python start_server.py
```

后端服务将在 http://localhost:8000 启动
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

### 前端启动

```bash
cd brick-frontend
pnpm install
pnpm run dev
```

前端服务将在 http://localhost:5173 启动

## API接口

### 租户管理
- `POST /api/v1/tenants/register` - 租户注册
- `GET /api/v1/tenants/` - 获取租户列表
- `GET /api/v1/tenants/{tenant_id}` - 获取租户详情
- `PUT /api/v1/tenants/{tenant_id}` - 更新租户信息
- `DELETE /api/v1/tenants/{tenant_id}` - 删除租户

### 认证系统（开发中）
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/logout` - 用户登出

## 开发状态

### 已完成
- ✅ 项目基础架构搭建
- ✅ 租户注册功能
- ✅ 前端页面开发
- ✅ 跨域问题解决
- ✅ 项目结构清理

### 进行中
- 🔄 后端数据库事务优化
- 🔄 认证系统开发

### 计划中
- 📋 用户管理功能
- 📋 角色权限系统
- 📋 租户仪表板
- 📋 数据统计功能

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
