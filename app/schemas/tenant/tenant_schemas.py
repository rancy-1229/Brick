"""
租户相关的数据验证Schema
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


class PlanType(str, Enum):
    """套餐类型枚举"""
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class TenantStatus(str, Enum):
    """租户状态枚举"""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class AdminUserRequest(BaseModel):
    """管理员用户请求模型"""
    full_name: str = Field(..., min_length=2, max_length=50, description="管理员姓名")
    email: str = Field(..., description="管理员邮箱")
    phone: Optional[str] = Field(None, description="管理员手机号")
    password: str = Field(..., min_length=8, max_length=50, description="管理员密码")
    avatar_url: Optional[str] = Field(None, description="头像URL")

    @validator('email')
    def validate_email(cls, v):
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('邮箱格式不正确')
        return v

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            import re
            if not re.match(r'^1[3-9]\d{9}$', v):
                raise ValueError('手机号格式不正确')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('密码长度至少8位')
        if len(v) > 50:
            raise ValueError('密码长度不能超过50位')
        # 检查密码复杂度
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_upper and has_lower and has_digit):
            raise ValueError('密码必须包含大小写字母和数字')
        return v


class AdminUserResponse(BaseModel):
    """管理员用户响应模型"""
    id: int
    user_id: str
    username: str
    email: str
    full_name: str
    role: str
    status: str

    class Config:
        from_attributes = True


class TenantCreateRequest(BaseModel):
    """创建租户请求模型"""
    name: str = Field(..., min_length=2, max_length=100, description="公司名称")
    domain: Optional[str] = Field(None, description="公司域名")
    admin_user: AdminUserRequest = Field(..., description="管理员用户信息")
    plan_type: PlanType = Field(PlanType.BASIC, description="套餐类型")
    max_users: int = Field(10, ge=10, le=10000, description="最大用户数")
    max_storage: int = Field(1073741824, ge=1073741824, le=1099511627776, description="最大存储空间(字节)")
    avatar_url: Optional[str] = Field(None, description="租户头像URL")
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="租户配置")

    @validator('domain')
    def validate_domain(cls, v):
        if v is not None:
            import re
            pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
            if not re.match(pattern, v):
                raise ValueError('域名格式不正确')
        return v

    @validator('max_storage')
    def validate_storage(cls, v):
        if v < 1073741824:  # 1GB
            raise ValueError('最小存储空间为1GB')
        if v > 1099511627776:  # 1TB
            raise ValueError('最大存储空间为1TB')
        return v


class TenantUpdateRequest(BaseModel):
    """更新租户请求模型"""
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="公司名称")
    domain: Optional[str] = Field(None, description="公司域名")
    avatar_url: Optional[str] = Field(None, description="租户头像URL")
    max_users: Optional[int] = Field(None, ge=10, le=10000, description="最大用户数")
    max_storage: Optional[int] = Field(None, ge=1073741824, le=1099511627776, description="最大存储空间(字节)")
    settings: Optional[Dict[str, Any]] = Field(None, description="租户配置")

    @validator('domain')
    def validate_domain(cls, v):
        if v is not None:
            import re
            pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
            if not re.match(pattern, v):
                raise ValueError('域名格式不正确')
        return v

    @validator('max_storage')
    def validate_storage(cls, v):
        if v is not None:
            if v < 1073741824:  # 1GB
                raise ValueError('最小存储空间为1GB')
            if v > 1099511627776:  # 1TB
                raise ValueError('最大存储空间为1TB')
        return v


class TenantData(BaseModel):
    """租户数据模型"""
    id: int
    tenant_id: str
    name: str
    domain: Optional[str]
    avatar_url: Optional[str]
    status: str
    plan_type: str
    max_users: int
    max_storage: int
    schema_name: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SetupInstructions(BaseModel):
    """设置说明模型"""
    schema_created: bool
    tables_created: bool
    admin_account_activated: bool


class TenantCreateData(BaseModel):
    """创建租户响应数据模型"""
    tenant: TenantData
    admin_user: AdminUserResponse
    setup_instructions: SetupInstructions


class TenantCreateResponse(BaseModel):
    """创建租户响应模型"""
    code: int
    message: str
    data: TenantCreateData


class TenantResponse(BaseModel):
    """租户响应模型"""
    code: int
    message: str
    data: TenantData


class PaginationInfo(BaseModel):
    """分页信息模型"""
    page: int
    size: int
    total: int
    pages: int


class TenantListData(BaseModel):
    """租户列表数据模型"""
    tenants: List[TenantData]
    pagination: PaginationInfo


class TenantListResponse(BaseModel):
    """租户列表响应模型"""
    code: int
    message: str
    data: TenantListData


# 统计信息相关的Schema
class UserStats(BaseModel):
    """用户统计信息"""
    total_users: int
    active_users: int
    inactive_users: int
    new_users_this_month: int


class StorageStats(BaseModel):
    """存储统计信息"""
    total_storage: int
    used_storage: int
    storage_percentage: float


class ApiStats(BaseModel):
    """API统计信息"""
    total_requests: int
    requests_this_month: int
    rate_limit: int


class BillingStats(BaseModel):
    """计费统计信息"""
    current_plan: str
    monthly_cost: float
    next_billing_date: Optional[datetime]


class TenantStatsData(BaseModel):
    """租户统计信息数据模型"""
    tenant_id: str
    user_stats: UserStats
    storage_stats: StorageStats
    api_stats: ApiStats
    billing_stats: BillingStats


class TenantStatsResponse(BaseModel):
    """租户统计信息响应模型"""
    code: int
    message: str
    data: TenantStatsData
