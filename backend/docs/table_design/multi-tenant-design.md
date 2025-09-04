# 多租户平台设计方案

## 概述

本文档描述了多租户平台的核心设计，包括租户管理、用户管理、数据隔离等关键组件的设计方案。

## 1. 多租户架构模式选择

### 1.1 数据库隔离策略

我们采用 **共享数据库，Schema隔离** 的模式，每个租户使用独立的PostgreSQL schema：

- **优势**：
  - 数据隔离更彻底，安全性更高
  - 查询性能更好，无需额外的租ant_id过滤
  - 支持租户级别的数据库权限控制
  - 便于租户数据备份和恢复
  - 支持租户级别的数据库优化
- **劣势**：
  - 跨租户数据分析相对复杂
  - 数据库对象数量增加
  - 需要动态schema切换机制

### 1.2 租户识别策略

- 通过 **子域名** 或 **路径** 识别租户
- 每个租户使用独立的PostgreSQL schema
- 租户信息存储在请求上下文中，动态切换数据库schema
- 支持租户级别的数据库权限控制

## 2. 核心表结构设计

### 2.1 租户表 (tenants)

```sql
-- 在公共schema中创建租户管理表
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE NOT NULL,  -- 租户唯一标识
    name VARCHAR(100) NOT NULL,              -- 租户名称
    domain VARCHAR(255),                     -- 租户域名
    avatar_url VARCHAR(255),                 -- 租户头像URL
    status tenant_status DEFAULT 'active',   -- 状态枚举
    plan_type tenant_plan_type DEFAULT 'basic', -- 套餐类型枚举
    max_users INTEGER DEFAULT 10,            -- 最大用户数
    max_storage BIGINT DEFAULT 1073741824,   -- 最大存储空间（字节）
    settings JSONB,                          -- 租户配置
    schema_name VARCHAR(63) UNIQUE NOT NULL, -- 租户schema名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 租户状态枚举
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'inactive');

-- 租户套餐类型枚举
CREATE TYPE tenant_plan_type AS ENUM ('basic', 'pro', 'enterprise');
```

### 2.2 用户表 (users)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,     -- 用户ID
    tenant_id VARCHAR(50) NOT NULL,          -- 租户ID
    username VARCHAR(50) NOT NULL,           -- 用户名
    email VARCHAR(255) NOT NULL,             -- 邮箱
    hashed_password VARCHAR(255) NOT NULL,   -- 加密密码
    full_name VARCHAR(100),                  -- 姓名
    phone VARCHAR(20),                       -- 电话
    avatar_url VARCHAR(255),                 -- 头像URL
    status user_status DEFAULT 'active',     -- 状态枚举
    role user_role DEFAULT 'user',           -- 角色枚举
    last_login_at TIMESTAMP WITH TIME ZONE,  -- 最后登录时间
    email_verified_at TIMESTAMP WITH TIME ZONE, -- 邮箱验证时间
    phone_verified_at TIMESTAMP WITH TIME ZONE, -- 手机验证时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, username),
    UNIQUE(tenant_id, email),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
```

### 2.3 角色权限表 (roles)

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,          -- 租户ID
    name VARCHAR(50) NOT NULL,               -- 角色名称
    description TEXT,                        -- 角色描述
    permissions JSONB,                       -- 权限配置
    is_system BOOLEAN DEFAULT FALSE,         -- 是否系统角色
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, name),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);
```

### 2.4 用户角色关联表 (user_roles)

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,          -- 租户ID
    user_id INTEGER NOT NULL,                -- 用户ID
    role_id INTEGER NOT NULL,                -- 角色ID
    assigned_by INTEGER,                     -- 分配人
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id, role_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

### 2.5 租户邀请表 (tenant_invitations)

```sql
CREATE TABLE tenant_invitations (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,          -- 租户ID
    email VARCHAR(255) NOT NULL,             -- 被邀请邮箱
    role_id INTEGER,                         -- 分配角色
    token VARCHAR(255) UNIQUE NOT NULL,      -- 邀请令牌
    status invitation_status DEFAULT 'pending', -- 状态枚举
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 过期时间
    invited_by INTEGER NOT NULL,             -- 邀请人
    accepted_at TIMESTAMP WITH TIME ZONE,    -- 接受时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- 邀请状态枚举
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
```

## 3. 数据隔离策略

### 3.1 应用层隔离

- 所有业务表都包含 `tenant_id` 字段
- 通过中间件自动注入租户上下文
- 所有查询都自动添加租ant_id条件

### 3.2 数据库层隔离

```sql
-- 创建租户隔离的视图
CREATE VIEW tenant_users AS
SELECT * FROM users WHERE tenant_id = current_setting('app.current_tenant_id')::VARCHAR;

-- 创建行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::VARCHAR);
```

## 4. 租户生命周期管理

### 4.1 租户创建流程

1. **注册阶段**：
   - 用户填写租户信息
   - 生成唯一的tenant_id
   - 创建默认角色和权限

2. **初始化阶段**：
   - 创建租户管理员账户
   - 设置默认配置
   - 分配初始资源

3. **激活阶段**：
   - 验证租户信息
   - 激活租户服务
   - 发送欢迎邮件

### 4.2 租户升级/降级

- 支持套餐类型变更
- 动态调整资源限制
- 数据迁移策略

### 4.3 租户停用/删除

- 软删除策略
- 数据备份
- 资源回收

## 5. 安全考虑

### 5.1 数据隔离安全

- 确保所有API都验证租ant_id
- 防止跨租户数据访问
- 定期安全审计

### 5.2 权限控制

- 基于角色的访问控制(RBAC)
- 细粒度权限管理
- 权限继承机制

### 5.3 审计日志

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. 性能优化

### 6.1 索引策略

```sql
-- 租户ID索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);

-- 复合索引
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_username ON users(tenant_id, username);
```

### 6.2 查询优化

- 使用数据库连接池
- 实现查询缓存
- 分页查询优化

## 7. 监控和运维

### 7.1 租户监控

- 资源使用情况监控
- 性能指标收集
- 异常告警机制

### 7.2 运维工具

- 租户管理后台
- 数据迁移工具
- 备份恢复工具

## 8. 扩展性考虑

### 8.1 水平扩展

- 支持多数据库实例
- 租户数据分片策略
- 负载均衡配置

### 8.2 功能扩展

- 插件化架构
- 自定义字段支持
- API版本管理

## 9. 实施计划

### 第一阶段：基础架构
- [ ] 创建核心表结构
- [ ] 实现租户识别中间件
- [ ] 基础用户管理功能

### 第二阶段：权限管理
- [ ] 角色权限系统
- [ ] 用户邀请功能
- [ ] 权限验证中间件

### 第三阶段：高级功能
- [ ] 租户管理后台
- [ ] 审计日志系统
- [ ] 性能监控

### 第四阶段：优化和扩展
- [ ] 性能优化
- [ ] 安全加固
- [ ] 功能扩展

## 10. 风险评估

### 10.1 技术风险
- 数据隔离失效
- 性能瓶颈
- 安全漏洞

### 10.2 业务风险
- 租户数据泄露
- 服务可用性
- 合规性问题

### 10.3 缓解措施
- 全面的测试覆盖
- 安全审计
- 备份策略
- 监控告警
