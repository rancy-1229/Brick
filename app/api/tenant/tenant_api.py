"""
租户API接口
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.core.pq_db import get_db
from app.services.tenant import TenantService
from app.schemas.tenant import (
    TenantCreateRequest,
    TenantCreateResponse,
    TenantResponse,
    TenantListResponse,
    TenantUpdateRequest
)

router = APIRouter(prefix="/tenants", tags=["租户管理"])


@router.post("/register", 
             response_model=TenantCreateResponse,
             status_code=status.HTTP_201_CREATED,
             summary="租户自助注册",
             description="租户自助注册，提供公司信息，自动生成tenant_id和管理员账号")
async def register_tenant(
    tenant_data: TenantCreateRequest,
    db: Session = Depends(get_db)
):
    """
    租户自助注册接口
    
    - **name**: 公司名称（必填）
    - **domain**: 公司域名（可选）
    - **admin_user**: 管理员用户信息（必填）
    - **plan_type**: 套餐类型（可选，默认basic）
    - **max_users**: 最大用户数（可选，默认10）
    - **max_storage**: 最大存储空间（可选，默认1GB）
    """
    try:
        # 创建租户服务实例
        tenant_service = TenantService(db)
        
        # 调用服务层创建租户
        result = tenant_service.create_tenant(tenant_data.dict())
        
        return TenantCreateResponse(
            code=201,
            message="租户注册成功",
            data=result
        )
        
    except ValueError as e:
        # 参数验证失败
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": 400,
                "message": "请求参数验证失败",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )
        
    except Exception as e:
        # 其他业务错误
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"创建租户失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )


@router.get("/me", 
            response_model=TenantResponse,
            summary="获取当前租户信息",
            description="获取当前登录用户所属租户的详细信息")
async def get_current_tenant(
    db: Session = Depends(get_db)
    # 这里需要添加租户上下文依赖，暂时省略
):
    """
    获取当前租户信息
    
    需要用户登录并设置租户上下文
    """
    try:
        # TODO: 从租户上下文获取当前租户ID
        # tenant_id = get_current_tenant_id()
        
        # 临时返回错误，等待租户上下文实现
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail={
                "code": 501,
                "message": "租户上下文功能尚未实现",
                "errors": [{"field": "general", "message": "请先实现租户上下文管理"}]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"获取租户信息失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )


@router.get("/", 
            response_model=TenantListResponse,
            summary="获取租户列表",
            description="获取租户列表（分页），需要超级管理员权限")
async def list_tenants(
    page: int = 1,
    size: int = 20,
    status: Optional[str] = None,
    plan_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
    # 这里需要添加超级管理员权限验证，暂时省略
):
    """
    获取租户列表（分页）
    
    - **page**: 页码（默认1）
    - **size**: 每页数量（默认20）
    - **status**: 状态过滤（可选）
    - **plan_type**: 套餐类型过滤（可选）
    - **search**: 搜索关键词（可选）
    """
    try:
        # TODO: 验证超级管理员权限
        # if not is_super_admin():
        #     raise HTTPException(status_code=403, detail="权限不足")
        
        # 创建租户服务实例
        tenant_service = TenantService(db)
        
        # 调用服务层获取租户列表
        result = tenant_service.list_tenants(
            page=page,
            size=size,
            status=status,
            plan_type=plan_type,
            search=search
        )
        
        return TenantListResponse(
            code=200,
            message="获取成功",
            data=result
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"获取租户列表失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )


@router.get("/{tenant_id}", 
            response_model=TenantResponse,
            summary="获取指定租户信息",
            description="获取指定租户的详细信息，需要超级管理员权限")
async def get_tenant(
    tenant_id: str,
    db: Session = Depends(get_db)
    # 这里需要添加超级管理员权限验证，暂时省略
):
    """
    获取指定租户信息
    
    - **tenant_id**: 租户ID
    """
    try:
        # TODO: 验证超级管理员权限
        # if not is_super_admin():
        #     raise HTTPException(status_code=403, detail="权限不足")
        
        # 创建租户服务实例
        tenant_service = TenantService(db)
        
        # 调用服务层获取租户信息
        tenant = tenant_service.get_tenant(tenant_id)
        
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": 404,
                    "message": "租户不存在",
                    "errors": [{"field": "tenant_id", "message": f"租户 {tenant_id} 不存在"}]
                }
            )
        
        return TenantResponse(
            code=200,
            message="获取成功",
            data=tenant_service._format_tenant_response(tenant)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"获取租户信息失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )


@router.put("/{tenant_id}", 
            response_model=TenantResponse,
            summary="更新租户信息",
            description="更新租户基本信息，需要超级管理员权限或租户管理员权限")
async def update_tenant(
    tenant_id: str,
    tenant_data: TenantUpdateRequest,
    db: Session = Depends(get_db)
    # 这里需要添加权限验证，暂时省略
):
    """
    更新租户信息
    
    - **tenant_id**: 租户ID
    - **tenant_data**: 更新的租户数据
    """
    try:
        # TODO: 验证权限（超级管理员或租户管理员）
        # if not has_permission(tenant_id, "update"):
        #     raise HTTPException(status_code=403, detail="权限不足")
        
        # 创建租户服务实例
        tenant_service = TenantService(db)
        
        # 获取现有租户
        tenant = tenant_service.get_tenant(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": 404,
                    "message": "租户不存在",
                    "errors": [{"field": "tenant_id", "message": f"租户 {tenant_id} 不存在"}]
                }
            )
        
        # TODO: 实现更新逻辑
        # 这里需要扩展TenantService，添加update_tenant方法
        
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail={
                "code": 501,
                "message": "更新租户功能尚未实现",
                "errors": [{"field": "general", "message": "请先实现租户更新逻辑"}]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"更新租户失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )


@router.delete("/{tenant_id}", 
               response_model=Dict[str, Any],
               summary="删除租户",
               description="软删除租户（标记为inactive），需要超级管理员权限")
async def delete_tenant(
    tenant_id: str,
    db: Session = Depends(get_db)
    # 这里需要添加超级管理员权限验证，暂时省略
):
    """
    删除租户（软删除）
    
    - **tenant_id**: 租户ID
    """
    try:
        # TODO: 验证超级管理员权限
        # if not is_super_admin():
        #     raise HTTPException(status_code=403, detail="权限不足")
        
        # TODO: 实现删除逻辑
        # 这里需要扩展TenantService，添加delete_tenant方法
        
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail={
                "code": 501,
                "message": "删除租户功能尚未实现",
                "errors": [{"field": "general", "message": "请先实现租户删除逻辑"}]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": 500,
                "message": f"删除租户失败: {str(e)}",
                "errors": [{"field": "general", "message": str(e)}]
            }
        )
