# PostgreSQL Schema 多租户数据隔离使用指南

## 概述

本文档详细描述了如何使用PostgreSQL Schema实现多租户数据隔离，包括架构设计、实现方式、代码示例和最佳实践。

## 1. 架构设计

### 1.1 隔离策略

我们采用 **共享数据库，Schema隔离** 的模式：

- **公共Schema (public)**: 存储租户管理信息
- **租户Schema (tenant_{tenant_id})**: 每个租户使用独立的schema
- **动态Schema切换**: 根据请求自动切换数据库schema

### 1.2 优势

- 数据隔离更彻底，安全性更高
- 查询性能更好，无需额外的租户ID过滤
- 支持租户级别的数据库权限控制
- 便于租户数据备份和恢复
- 支持租户级别的数据库优化

### 1.3 劣势

- 跨租户数据分析相对复杂
- 数据库对象数量增加
- 需要动态schema切换机制

## 2. 核心组件

### 2.1 Schema管理器 (SchemaManager)

```python
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SchemaManager:
    """PostgreSQL Schema管理工具"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def create_tenant_schema(self, tenant_id: str) -> bool:
        """为租户创建独立的schema"""
        try:
            schema_name = f"tenant_{tenant_id}"
            
            # 创建schema
            self.db_session.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            
            # 设置默认权限
            self.db_session.execute(text(f"GRANT ALL PRIVILEGES ON SCHEMA {schema_name} TO CURRENT_USER"))
            
            self.db_session.commit()
            logger.info(f"成功创建租户schema: {schema_name}")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"创建租户schema失败: {e}")
            return False
    
    def drop_tenant_schema(self, tenant_id: str) -> bool:
        """删除租户schema"""
        try:
            schema_name = f"tenant_{tenant_id}"
            
            # 删除schema（CASCADE会删除schema中的所有对象）
            self.db_session.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
            
            self.db_session.commit()
            logger.info(f"成功删除租户schema: {schema_name}")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"删除租户schema失败: {e}")
            return False
    
    def set_search_path(self, tenant_id: Optional[str] = None):
        """设置数据库搜索路径"""
        try:
            if tenant_id:
                schema_name = f"tenant_{tenant_id}"
                self.db_session.execute(text(f"SET search_path TO {schema_name}, public"))
                logger.debug(f"设置搜索路径到: {schema_name}")
            else:
                # 重置为默认路径
                self.db_session.execute(text("SET search_path TO public"))
                logger.debug("重置搜索路径到: public")
                
        except Exception as e:
            logger.error(f"设置搜索路径失败: {e}")


def get_schema_manager(db: Session) -> SchemaManager:
    """获取SchemaManager实例"""
    return SchemaManager(db)
```

### 2.2 租户上下文管理器 (TenantContext)

```python
from contextvars import ContextVar
from typing import Optional
from fastapi import Request, Depends
from sqlalchemy.orm import Session
from .schema_manager import get_schema_manager

# 租户上下文变量
tenant_context: ContextVar[Optional[str]] = ContextVar("tenant_id", default=None)


class TenantContext:
    """租户上下文管理器"""
    
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.schema_name = f"tenant_{tenant_id}"
    
    def __enter__(self):
        # 设置租户上下文
        tenant_context.set(self.tenant_id)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # 清除租户上下文
        tenant_context.set(None)


def get_current_tenant() -> Optional[str]:
    """获取当前租户ID"""
    return tenant_context.get()


def get_current_schema() -> Optional[str]:
    """获取当前租户schema名称"""
    tenant_id = get_current_tenant()
    if tenant_id:
        return f"tenant_{tenant_id}"
    return None


def extract_tenant_from_request(request: Request) -> Optional[str]:
    """从请求中提取租户信息"""
    # 方法1: 从子域名提取
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain and subdomain != "www":
            return subdomain
    
    # 方法2: 从路径提取
    path = request.url.path
    if path.startswith("/tenant/"):
        tenant_part = path.split("/")[2]
        if tenant_part:
            return tenant_part
    
    # 方法3: 从查询参数提取
    tenant_id = request.query_params.get("tenant_id")
    if tenant_id:
        return tenant_id
    
    # 方法4: 从请求头提取
    tenant_id = request.headers.get("x-tenant-id")
    if tenant_id:
        return tenant_id
    
    return None


def set_tenant_context(tenant_id: str, db: Session):
    """设置租户上下文并切换数据库schema"""
    schema_manager = get_schema_manager(db)
    schema_manager.set_search_path(tenant_id)
    tenant_context.set(tenant_id)


def clear_tenant_context(db: Session):
    """清除租户上下文并重置数据库schema"""
    schema_manager = get_schema_manager(db)
    schema_manager.set_search_path(None)
    tenant_context.set(None)
```

## 3. 数据模型设计

### 3.1 租户表 (公共Schema)

```python
from sqlalchemy import Column, Integer, String, DateTime, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from core.pq_db import Base


class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__ = {'schema': 'public'}  # 租户表在公共schema中

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), unique=True, nullable=False, index=True, description='租户唯一标识')
    name = Column(String(100), nullable=False, description='租户名称')
    domain = Column(String(255), description='租户域名')
    avatar_url = Column(String(255), description='租户头像')
    
    # 使用枚举类型
    status = Column(ENUM('active', 'suspended', 'inactive', name='tenant_status'), 
                   default='active', nullable=False, description='租户状态')
    plan_type = Column(ENUM('basic', 'pro', 'enterprise', name='tenant_plan_type'), 
                      default='basic', nullable=False, description='租户套餐类型')
    
    max_users = Column(Integer, default=10, description='最大用户数')
    max_storage = Column(BigInteger, default=1073741824, description='最大存储空间')  # 1GB in bytes
    settings = Column(JSONB, description='租户配置')
    schema_name = Column(String(63), unique=True, nullable=False, index=True, description='租户schema名称')
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), description='创建时间')
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), description='更新时间')
```

### 3.2 业务表 (租户Schema)

```python
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM
from core.pq_db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, nullable=False, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    phone = Column(String(20))
    avatar_url = Column(String(255))
    
    # 使用枚举类型
    status = Column(ENUM('active', 'inactive', 'suspended', name='user_status'), 
                   default='active', nullable=False)
    role = Column(ENUM('super_admin', 'admin', 'user', name='user_role'), 
                 default='user', nullable=False)
    
    last_login_at = Column(DateTime(timezone=True))
    email_verified_at = Column(DateTime(timezone=True))
    phone_verified_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 约束
    __table_args__ = (
        # 用户名和邮箱在租户schema内唯一
        {'schema': None}  # 动态设置schema
    )
```

## 4. 使用方式

### 4.1 创建租户

```python
from sqlalchemy.orm import Session
from core.schema_manager import get_schema_manager
from models.tenant import Tenant
import uuid

def create_tenant(db: Session, name: str, domain: str) -> Tenant:
    """创建新租户"""
    # 1. 生成租户ID
    tenant_id = f"tenant_{uuid.uuid4().hex[:8]}"
    schema_name = f"tenant_{tenant_id}"
    
    # 2. 创建租户记录
    tenant = Tenant(
        tenant_id=tenant_id,
        name=name,
        domain=domain,
        schema_name=schema_name,
        status='active',
        plan_type='basic'
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # 3. 创建租户schema
    schema_manager = get_schema_manager(db)
    if schema_manager.create_tenant_schema(tenant_id):
        # 4. 在租户schema中创建表
        create_tenant_tables(db, tenant_id)
        return tenant
    else:
        # 回滚租户创建
        db.delete(tenant)
        db.commit()
        raise Exception("创建租户schema失败")

def create_tenant_tables(db: Session, tenant_id: str):
    """在租户schema中创建所有表"""
    schema_name = f"tenant_{tenant_id}"
    
    # 设置schema
    schema_manager = get_schema_manager(db)
    schema_manager.set_search_path(tenant_id)
    
    # 创建表（这里需要根据具体的模型来创建）
    # 注意：需要为每个表设置正确的schema
    create_table_sql = f"""
    CREATE TABLE {schema_name}.users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url VARCHAR(255),
        status user_status DEFAULT 'active',
        role user_role DEFAULT 'user',
        last_login_at TIMESTAMP WITH TIME ZONE,
        email_verified_at TIMESTAMP WITH TIME ZONE,
        phone_verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    db.execute(text(create_table_sql))
    db.commit()
```

### 4.2 租户数据操作

```python
from sqlalchemy.orm import Session
from core.tenant_context import set_tenant_context, clear_tenant_context
from models.user import User

def create_user_in_tenant(db: Session, tenant_id: str, user_data: dict) -> User:
    """在指定租户中创建用户"""
    try:
        # 设置租户上下文
        set_tenant_context(tenant_id, db)
        
        # 创建用户
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
        
    finally:
        # 清除租户上下文
        clear_tenant_context(db)

def get_users_in_tenant(db: Session, tenant_id: str) -> list[User]:
    """获取指定租户的所有用户"""
    try:
        # 设置租户上下文
        set_tenant_context(tenant_id, db)
        
        # 查询用户
        users = db.query(User).all()
        return users
        
    finally:
        # 清除租户上下文
        clear_tenant_context(db)
```

### 4.3 FastAPI集成

```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from core.tenant_context import get_tenant_dependency, set_tenant_context, clear_tenant_context
from core.pq_db import get_db
from models.user import User

app = FastAPI()

@app.post("/users/")
def create_user(
    user_data: dict,
    tenant_id: str = Depends(get_tenant_dependency),
    db: Session = Depends(get_db)
):
    """创建用户（自动在租户schema中）"""
    try:
        # 租户上下文已通过依赖函数设置
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        # 清除租户上下文
        clear_tenant_context(db)

@app.get("/users/")
def get_users(
    tenant_id: str = Depends(get_tenant_dependency),
    db: Session = Depends(get_db)
):
    """获取用户列表（自动从租户schema中）"""
    try:
        # 租户上下文已通过依赖函数设置
        users = db.query(User).all()
        return users
        
    finally:
        # 清除租户上下文
        clear_tenant_context(db)
```

## 5. 中间件实现

### 5.1 租户识别中间件

```python
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.tenant_context import extract_tenant_from_request, set_tenant_context, clear_tenant_context
from core.pq_db import get_db

class TenantMiddleware(BaseHTTPMiddleware):
    """租户识别中间件"""
    
    async def dispatch(self, request: Request, call_next):
        # 提取租户信息
        tenant_id = extract_tenant_from_request(request)
        
        if tenant_id:
            # 设置租户上下文
            db = next(get_db())
            try:
                set_tenant_context(tenant_id, db)
                request.state.tenant_id = tenant_id
                
                # 继续处理请求
                response = await call_next(request)
                return response
                
            finally:
                # 清除租户上下文
                clear_tenant_context(db)
        else:
            # 没有租户信息，继续处理请求
            response = await call_next(request)
            return response

# 在FastAPI应用中注册中间件
app.add_middleware(TenantMiddleware)
```

## 6. 数据库管理

### 6.1 Schema创建脚本

```sql
-- 创建租户schema
CREATE SCHEMA tenant_example123;

-- 在租户schema中创建表
CREATE TABLE tenant_example123.users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    status user_status DEFAULT 'active',
    role user_role DEFAULT 'user',
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设置schema搜索路径
SET search_path TO tenant_example123, public;

-- 创建租户用户并设置权限
CREATE USER tenant_example123_user;
GRANT USAGE ON SCHEMA tenant_example123 TO tenant_example123_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA tenant_example123 TO tenant_example123_user;
```

### 6.2 索引策略

```sql
-- 租户表索引（公共schema）
CREATE INDEX idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_schema_name ON tenants(schema_name);

-- 用户表索引（租户schema）
CREATE INDEX idx_users_user_id ON tenant_example123.users(user_id);
CREATE INDEX idx_users_email ON tenant_example123.users(email);
CREATE INDEX idx_users_username ON tenant_example123.users(username);
CREATE INDEX idx_users_status ON tenant_example123.users(status);
```

## 7. 最佳实践

### 7.1 性能优化

1. **连接池管理**: 为每个租户维护独立的数据库连接池
2. **查询优化**: 利用schema隔离避免租户ID过滤
3. **索引策略**: 在租户schema中创建合适的索引

### 7.2 安全性

1. **权限控制**: 为每个租户创建独立的数据库用户
2. **数据隔离**: 确保租户间数据完全隔离
3. **审计日志**: 记录所有schema操作

### 7.3 监控和维护

1. **Schema监控**: 监控租户schema的使用情况
2. **性能监控**: 监控各租户的查询性能
3. **备份策略**: 支持租户级别的数据备份

## 8. 注意事项

1. **Schema命名**: 确保schema名称符合PostgreSQL命名规范
2. **事务管理**: 注意跨schema事务的处理
3. **连接管理**: 及时清理租户上下文，避免连接泄漏
4. **错误处理**: 妥善处理schema不存在的异常情况

## 9. 总结

PostgreSQL Schema多租户隔离提供了强大的数据隔离能力，通过合理的架构设计和实现，可以实现高效、安全的多租户应用。关键是要正确管理schema的生命周期，合理使用上下文管理，并注意性能优化和安全性。
