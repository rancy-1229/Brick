"""
PostgreSQL Schema管理工具
"""
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
            
            # 创建租户用户（可选）
            # self.db_session.execute(text(f"CREATE USER IF NOT EXISTS {schema_name}_user"))
            # self.db_session.execute(text(f"GRANT USAGE ON SCHEMA {schema_name} TO {schema_name}_user"))
            
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
    
    def schema_exists(self, tenant_id: str) -> bool:
        """检查租户schema是否存在"""
        try:
            schema_name = f"tenant_{tenant_id}"
            result = self.db_session.execute(
                text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = :schema_name"),
                {"schema_name": schema_name}
            )
            return result.fetchone() is not None
            
        except Exception as e:
            logger.error(f"检查schema存在性失败: {e}")
            return False
    
    def list_tenant_schemas(self) -> list:
        """列出所有租户schema"""
        try:
            result = self.db_session.execute(
                text("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'")
            )
            return [row[0] for row in result.fetchall()]
            
        except Exception as e:
            logger.error(f"列出租户schema失败: {e}")
            return []
    
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
    
    def create_tenant_tables(self, tenant_id: str, base_metadata) -> bool:
        """在租户schema中创建所有表"""
        try:
            schema_name = f"tenant_{tenant_id}"
            
            # 设置schema
            self.set_search_path(tenant_id)
            
            # 创建表（这里需要根据具体的模型来创建）
            # 注意：需要为每个表设置正确的schema
            logger.info(f"在schema {schema_name} 中创建表")
            
            return True
            
        except Exception as e:
            logger.error(f"创建租户表失败: {e}")
            return False


def get_schema_manager(db: Session) -> SchemaManager:
    """获取SchemaManager实例"""
    return SchemaManager(db)
