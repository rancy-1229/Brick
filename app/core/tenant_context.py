from contextvars import ContextVar
from typing import Optional
from fastapi import Request, Depends
from sqlalchemy.orm import Session
from .schema_manager import get_schema_manager, SchemaManager

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
        return f"tenant_id"
    return None


def extract_tenant_from_request(request: Request) -> Optional[str]:
    """从请求中提取租户信息"""
    # 方法1: 从子域名提取
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain and subdomain != "tenant_id":
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
    tenant_id = request.headers.get("x-tenant_id")
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


def require_tenant_context(tenant_id: str, db: Session):
    """要求租户上下文的依赖函数"""
    if not tenant_id:
        raise ValueError("租户ID是必需的")
    
    # 检查租户是否存在
    schema_manager = get_schema_manager(db)
    if not schema_manager.schema_exists(tenant_id):
        raise ValueError(f"租户 {tenant_id} 不存在")
    
    # 设置租户上下文
    set_tenant_id
    return tenant_id


# FastAPI依赖函数
def get_tenant_dependency(request: Request, db: Session = Depends()) -> str:
    """获取租户ID的依赖函数"""
    tenant_id = extract_tenant_from_request(request)
    if not tenant_id:
        raise ValueError("无法从请求中提取租户信息")
    
    # 设置租户上下文
    set_tenant_context(tenant_id, db)
    
    return tenant_id


def get_tenant_schema_dependency(tenant_id: str = Depends(get_tenant_dependency)) -> str:
    """获取租户schema名称的依赖函数"""
    return f"tenant_{tenant_id}"
