"""
租户数据访问层
"""
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantRepo:
    """
    租户数据访问层
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, tenant: Tenant) -> Tenant:
        """
        创建租户
        
        Args:
            tenant: 租户对象
            
        Returns:
            创建的租户对象
        """
        try:
            self.db.add(tenant)
            self.db.flush()  # 获取ID但不提交
            return tenant
        except Exception as e:
            logger.error(f"创建租户失败: {str(e)}")
            raise e

    def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        """
        根据租户ID获取租户
        
        Args:
            tenant_id: 租户ID
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()

    def get_by_domain(self, domain: str) -> Optional[Tenant]:
        """
        根据域名获取租户
        
        Args:
            domain: 域名
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.db.query(Tenant).filter(Tenant.domain == domain).first()

    def get_by_name(self, name: str) -> Optional[Tenant]:
        """
        根据名称获取租户
        
        Args:
            name: 租户名称
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.db.query(Tenant).filter(Tenant.name == name).first()

    def get_by_schema_name(self, schema_name: str) -> Optional[Tenant]:
        """
        根据schema名称获取租户
        
        Args:
            schema_name: Schema名称
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.db.query(Tenant).filter(Tenant.schema_name == schema_name).first()

    def list_all(self, page: int = 1, size: int = 20, 
                 status: Optional[str] = None, 
                 plan_type: Optional[str] = None, 
                 search: Optional[str] = None) -> Dict[str, Any]:
        """
        获取租户列表（分页）
        
        Args:
            page: 页码
            size: 每页数量
            status: 状态过滤
            plan_type: 套餐类型过滤
            search: 搜索关键词
            
        Returns:
            包含租户列表和分页信息的字典
        """
        query = self.db.query(Tenant)
        
        # 应用过滤条件
        if status:
            query = query.filter(Tenant.status == status)
        if plan_type:
            query = query.filter(Tenant.plan_type == plan_type)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Tenant.name.ilike(search_term),
                    Tenant.domain.ilike(search_term),
                    Tenant.tenant_id.ilike(search_term)
                )
            )
        
        # 计算总数
        total = query.count()
        
        # 分页
        tenants = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "tenants": tenants,
            "pagination": {
                "page": page,
                "size": size,
                "total": total,
                "pages": (total + size - 1) // size
            }
        }

    def update(self, tenant: Tenant) -> Tenant:
        """
        更新租户
        
        Args:
            tenant: 租户对象
            
        Returns:
            更新后的租户对象
        """
        try:
            self.db.flush()
            return tenant
        except Exception as e:
            logger.error(f"更新租户失败: {str(e)}")
            raise e

    def delete(self, tenant: Tenant) -> bool:
        """
        删除租户
        
        Args:
            tenant: 租户对象
            
        Returns:
            是否删除成功
        """
        try:
            self.db.delete(tenant)
            return True
        except Exception as e:
            logger.error(f"删除租户失败: {str(e)}")
            return False

    def exists_by_name(self, name: str, exclude_id: Optional[str] = None) -> bool:
        """
        检查租户名称是否存在
        
        Args:
            name: 租户名称
            exclude_id: 排除的租户ID（用于更新时检查）
            
        Returns:
            是否存在
        """
        query = self.db.query(Tenant).filter(Tenant.name == name)
        if exclude_id:
            query = query.filter(Tenant.tenant_id != exclude_id)
        return query.first() is not None

    def exists_by_domain(self, domain: str, exclude_id: Optional[str] = None) -> bool:
        """
        检查域名是否存在
        
        Args:
            domain: 域名
            exclude_id: 排除的租户ID（用于更新时检查）
            
        Returns:
            是否存在
        """
        query = self.db.query(Tenant).filter(Tenant.domain == domain)
        if exclude_id:
            query = query.filter(Tenant.tenant_id != exclude_id)
        return query.first() is not None

    def exists_by_schema_name(self, schema_name: str, exclude_id: Optional[str] = None) -> bool:
        """
        检查schema名称是否存在
        
        Args:
            schema_name: Schema名称
            exclude_id: 排除的租户ID（用于更新时检查）
            
        Returns:
            是否存在
        """
        query = self.db.query(Tenant).filter(Tenant.schema_name == schema_name)
        if exclude_id:
            query = query.filter(Tenant.schema_name != exclude_id)
        return query.first() is not None

    def count_by_status(self, status: str) -> int:
        """
        统计指定状态的租户数量
        
        Args:
            status: 状态
            
        Returns:
            数量
        """
        return self.db.query(Tenant).filter(Tenant.status == status).count()

    def count_by_plan_type(self, plan_type: str) -> int:
        """
        统计指定套餐类型的租户数量
        
        Args:
            plan_type: 套餐类型
            
        Returns:
            数量
        """
        return self.db.query(Tenant).filter(Tenant.plan_type == plan_type).count()

    def get_active_tenants(self) -> List[Tenant]:
        """
        获取所有活跃的租户
        
        Returns:
            活跃租户列表
        """
        return self.db.query(Tenant).filter(Tenant.status == 'active').all()

    def get_pending_tenants(self) -> List[Tenant]:
        """
        获取所有待激活的租户
        
        Returns:
            待激活租户列表
        """
        return self.db.query(Tenant).filter(Tenant.status == 'pending').all()

    def get_suspended_tenants(self) -> List[Tenant]:
        """
        获取所有暂停的租户
        
        Returns:
            暂停租户列表
        """
        return self.db.query(Tenant).filter(Tenant.status == 'suspended').all()
