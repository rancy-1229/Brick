# 多租户平台API使用说明

## 快速开始

### 1. 启动服务

```bash
# 方式1: 使用启动脚本
python start_server.py

# 方式2: 直接使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 访问API文档

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/health

## API接口列表

### 租户管理接口

#### 1. 租户自助注册

**接口**: `POST /api/v1/tenants/register`

**描述**: 租户自助注册，提供公司信息，自动生成tenant_id和管理员账号

**请求示例**:
```json
{
  "name": "示例科技有限公司",
  "domain": "example.com",
  "admin_user": {
    "full_name": "张三",
    "email": "admin@example.com",
    "phone": "13800138000",
    "password": "SecurePass123!"
  },
  "plan_type": "basic",
  "max_users": 50,
  "max_storage": 10737418240
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "租户注册成功",
  "data": {
    "tenant": {
      "id": 1,
      "tenant_id": "tenant_a1b2c3d4",
      "name": "示例科技有限公司",
      "domain": "example.com",
      "status": "pending",
      "plan_type": "basic",
      "max_users": 50,
      "max_storage": 10737418240,
      "schema_name": "tenant_a1b2c3d4",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "admin_user": {
      "id": 1,
      "user_id": "user_e5f6g7h8",
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "张三",
      "role": "super_admin",
      "status": "active"
    },
    "setup_instructions": {
      "schema_created": true,
      "tables_created": true,
      "admin_account_activated": true
    }
  }
}
```

#### 2. 获取租户列表

**接口**: `GET /api/v1/tenants/`

**描述**: 获取租户列表（分页），需要超级管理员权限

**查询参数**:
- `page`: 页码（默认1）
- `size`: 每页数量（默认20）
- `status`: 状态过滤（可选）
- `plan_type`: 套餐类型过滤（可选）
- `search`: 搜索关键词（可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "tenants": [
      {
        "id": 1,
        "tenant_id": "tenant_a1b2c3d4",
        "name": "示例科技有限公司",
        "domain": "example.com",
        "status": "active",
        "plan_type": "basic",
        "max_users": 50,
        "max_storage": 10737418240,
        "schema_name": "tenant_a1b2c3d4",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 3. 获取指定租户信息

**接口**: `GET /api/v1/tenants/{tenant_id}`

**描述**: 获取指定租户的详细信息，需要超级管理员权限

**路径参数**:
- `tenant_id`: 租户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "tenant_id": "tenant_a1b2c3d4",
    "name": "示例科技有限公司",
    "domain": "example.com",
    "status": "active",
    "plan_type": "basic",
    "max_users": 50,
    "max_storage": 10737418240,
    "schema_name": "tenant_a1b2c3d4",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. 更新租户信息

**接口**: `PUT /api/v1/tenants/{tenant_id}`

**描述**: 更新租户基本信息，需要超级管理员权限或租户管理员权限

**路径参数**:
- `tenant_id`: 租户ID

**请求示例**:
```json
{
  "name": "新公司名称",
  "max_users": 100,
  "max_storage": 21474836480
}
```

#### 5. 删除租户

**接口**: `DELETE /api/v1/tenants/{tenant_id}`

**描述**: 软删除租户（标记为inactive），需要超级管理员权限

**路径参数**:
- `tenant_id`: 租户ID

## 数据验证规则

### 租户信息验证

- **name**: 公司名称，长度2-100字符，必填
- **domain**: 公司域名，可选，需符合域名格式
- **plan_type**: 套餐类型，可选值：basic/pro/enterprise，默认basic
- **max_users**: 最大用户数，范围10-10000，默认10
- **max_storage**: 最大存储空间，范围1GB-1TB，默认1GB

### 管理员用户验证

- **full_name**: 姓名，长度2-50字符，必填
- **email**: 邮箱，需符合邮箱格式，必填
- **phone**: 手机号，可选，需符合11位手机号格式
- **password**: 密码，长度8-50字符，需包含大小写字母和数字，必填

## 错误处理

### 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数验证失败",
  "errors": [
    {
      "field": "name",
      "message": "公司名称不能为空"
    }
  ]
}
```

### 常见HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 测试API

### 使用测试脚本

```bash
# 运行API测试
python test_api.py
```

### 使用curl命令

```bash
# 健康检查
curl http://localhost:8000/health

# 租户注册
curl -X POST "http://localhost:8000/api/v1/tenants/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试公司",
    "admin_user": {
      "full_name": "测试用户",
      "email": "test@example.com",
      "password": "TestPass123!"
    }
  }'

# 获取租户列表
curl http://localhost:8000/api/v1/tenants/
```

## 开发说明

### 项目结构

```
app/
├── api/                    # API接口层
│   └── tenant/            # 租户相关接口
├── services/               # 业务逻辑层
│   └── tenant/            # 租户业务逻辑
├── repos/                  # 数据访问层
│   └── tenant/            # 租户数据访问
├── models/                 # 数据模型层
├── schemas/                # 数据验证Schema
├── core/                   # 核心基础设施
└── main.py                 # 应用入口
```

### 添加新接口

1. 在对应的API模块中添加路由
2. 在Service层实现业务逻辑
3. 在Repo层实现数据访问
4. 在Schema中定义数据验证规则

### 权限控制

目前权限控制功能尚未实现，需要后续添加：

1. 用户认证中间件
2. 权限验证装饰器
3. 租户上下文管理
4. 角色权限系统

## 部署说明

### 生产环境

```bash
# 使用gunicorn部署
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 使用uvicorn部署
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 环境变量

```bash
# 数据库配置
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/dbname

# 其他配置
LOG_LEVEL=info
DEBUG=false
```

## 注意事项

1. **数据库连接**: 确保PostgreSQL服务正在运行
2. **Schema权限**: 确保数据库用户有创建Schema的权限
3. **数据验证**: 所有输入都会进行严格验证
4. **错误处理**: 详细的错误信息有助于调试
5. **日志记录**: 重要操作都会记录日志

## 后续开发计划

1. **用户认证**: 实现JWT认证和用户登录
2. **权限控制**: 实现基于角色的权限控制
3. **租户上下文**: 完善租户识别和上下文管理
4. **更多接口**: 添加用户管理、角色管理等接口
5. **监控告警**: 添加性能监控和告警机制
