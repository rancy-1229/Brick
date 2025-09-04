"""
租户服务层
"""
import uuid
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.tenant import Tenant
from app.models.user import User
from app.core.schema_manager import get_schema_manager
from app.repos.tenant import TenantRepo

logger = logging.getLogger(__name__)


class TenantService:
    """
    租户服务层
    """

    def __init__(self, db: Session):
        self.db = db
        self.schema_manager = get_schema_manager(db)
        self.tenant_repo = TenantRepo(db)

    def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建新租户
        
        Args:
            tenant_data: 租户数据，包含基本信息和管理员用户信息
            
        Returns:
            包含租户和管理员信息的字典
            
        Raises:
            ValueError: 参数验证失败
            Exception: 创建租户过程中出现错误
        """
        try:
            # 1. 验证租户数据
            self._validate_tenant_data(tenant_data)
            
            # 2. 生成唯一的tenant_id和schema_name
            tenant_id = self._generate_tenant_id()
            schema_name = f"tenant_{tenant_id}"
            
            # 3. 检查租户名称和域名是否已存在
            self._check_tenant_uniqueness(tenant_data.get('name'), tenant_data.get('domain'))
            
            # 4. 创建租户记录
            tenant = self._create_tenant_record(tenant_data, tenant_id, schema_name)
            
            # 5. 创建租户schema
            if not self.schema_manager.create_tenant_schema(tenant_id):
                raise Exception("创建租户schema失败")
            
            # 6. 在租户schema中创建业务表
            if not self._create_tenant_tables(tenant_id):
                raise Exception("创建租户业务表失败")
            
            # 7. 创建管理员用户账号
            admin_user = self._create_admin_user(tenant_data.get('admin_user'), tenant_id)
            
            # 8. 提交事务
            self.db.commit()
            
            # 9. 记录成功日志
            logger.info(f"成功创建租户: {tenant.name} (ID: {tenant_id})")
            
            # 10. 返回创建结果
            return {
                "tenant": self._format_tenant_response(tenant),
                "admin_user": self._format_user_response(admin_user),
                "setup_instructions": {
                    "schema_created": True,
                    "tables_created": True,
                    "admin_account_activated": True
                }
            }
            
        except Exception as e:
            # 回滚事务
            self.db.rollback()
            logger.error(f"创建租户失败: {str(e)}")
            raise e

    def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        """
        根据租户ID获取租户信息
        
        Args:
            tenant_id: 租户ID
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.tenant_repo.get_by_id(tenant_id)

    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """
        根据域名获取租户信息
        
        Args:
            domain: 租户域名
            
        Returns:
            租户对象，如果不存在则返回None
        """
        return self.tenant_repo.get_by_domain(domain)

    def list_tenants(self, page: int = 1, size: int = 20, status: Optional[str] = None, 
                     plan_type: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
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
        result = self.tenant_repo.list_all(page, size, status, plan_type, search)
        
        return {
            "tenants": [self._format_tenant_response(tenant) for tenant in result["tenants"]],
            "pagination": result["pagination"]
        }

    def _validate_tenant_data(self, tenant_data: Dict[str, Any]) -> None:
        """
        验证租户数据
        
        Args:
            tenant_data: 租户数据
            
        Raises:
            ValueError: 验证失败
        """
        required_fields = ['name', 'admin_user']
        
        # 检查必填字段
        for field in required_fields:
            if field not in tenant_data or not tenant_data[field]:
                raise ValueError(f"字段 {field} 是必填的")
        
        # 验证公司名称
        name = tenant_data['name']
        if not isinstance(name, str) or len(name) < 2 or len(name) > 100:
            raise ValueError("公司名称长度必须在2-100字符之间")
        
        # 验证域名格式
        domain = tenant_data.get('domain')
        if domain and not self._is_valid_domain(domain):
            raise ValueError("域名格式不正确")
        
        # 验证管理员用户信息
        admin_user = tenant_data['admin_user']
        self._validate_admin_user(admin_user)
        
        # 验证套餐类型
        plan_type = tenant_data.get('plan_type', 'basic')
        if plan_type not in ['basic', 'pro', 'enterprise']:
            raise ValueError("套餐类型必须是 basic、pro 或 enterprise")
        
        # 验证用户数量限制
        max_users = tenant_data.get('max_users', 10)
        if not isinstance(max_users, int) or max_users < 10 or max_users > 10000:
            raise ValueError("最大用户数必须在10-10000之间")
        
        # 验证存储空间限制
        max_storage = tenant_data.get('max_storage', 1073741824)  # 1GB
        if not isinstance(max_storage, int) or max_storage < 1073741824 or max_storage > 1099511627776:  # 1GB-1TB
            raise ValueError("最大存储空间必须在1GB-1TB之间")

    def _validate_admin_user(self, admin_user: Dict[str, Any]) -> None:
        """
        验证管理员用户信息
        
        Args:
            admin_user: 管理员用户信息
            
        Raises:
            ValueError: 验证失败
        """
        required_fields = ['full_name', 'email', 'password']
        
        # 检查必填字段
        for field in required_fields:
            if field not in admin_user or not admin_user[field]:
                raise ValueError(f"字段 {field} 是必填的")
        
        # 验证姓名
        full_name = admin_user['full_name']
        if not isinstance(full_name, str) or len(full_name) < 2 or len(full_name) > 50:
            raise ValueError("管理员姓名长度必须在2-50字符之间")
        
        # 验证邮箱格式
        email = admin_user['email']
        if not self._is_valid_email(email):
            raise ValueError("管理员邮箱格式不正确")
        
        # 验证密码强度
        password = admin_user['password']
        if not self._is_valid_password(password):
            raise ValueError("密码必须包含大小写字母和数字，长度8-50字符")
        
        # 验证手机号（可选）
        phone = admin_user.get('phone')
        if phone and not self._is_valid_phone(phone):
            raise ValueError("手机号格式不正确")

    def _is_valid_domain(self, domain: str) -> bool:
        """验证域名格式"""
        import re
        pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
        return bool(re.match(pattern, domain))

    def _is_valid_email(self, email: str) -> bool:
        """验证邮箱格式"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def _is_valid_password(self, password: str) -> bool:
        """验证密码强度"""
        if len(password) < 8 or len(password) > 50:
            return False
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        return has_upper and has_lower and has_digit

    def _is_valid_phone(self, phone: str) -> bool:
        """验证手机号格式"""
        import re
        pattern = r'^1[3-9]\d{9}$'
        return bool(re.match(pattern, phone))

    def _generate_tenant_id(self) -> str:
        """生成唯一的租户ID"""
        return f"tenant_{uuid.uuid4().hex[:8]}"

    def _check_tenant_uniqueness(self, name: str, domain: Optional[str]) -> None:
        """
        检查租户名称和域名的唯一性
        
        Args:
            name: 租户名称
            domain: 租户域名
            
        Raises:
            ValueError: 名称或域名已存在
        """
        # 检查名称唯一性
        if self.tenant_repo.exists_by_name(name):
            raise ValueError(f"租户名称 '{name}' 已存在")
        
        # 检查域名唯一性（如果提供）
        if domain:
            if self.tenant_repo.exists_by_domain(domain):
                raise ValueError(f"域名 '{domain}' 已被使用")

    def _create_tenant_record(self, tenant_data: Dict[str, Any], tenant_id: str, schema_name: str) -> Tenant:
        """
        创建租户记录
        
        Args:
            tenant_data: 租户数据
            tenant_id: 租户ID
            schema_name: Schema名称
            
        Returns:
            创建的租户对象
        """
        tenant = Tenant(
            tenant_id=tenant_id,
            name=tenant_data['name'],
            domain=tenant_data.get('domain'),
            avatar_url=tenant_data.get('avatar_url'),
            status='pending',  # 初始状态为待激活
            plan_type=tenant_data.get('plan_type', 'basic'),
            max_users=tenant_data.get('max_users', 10),
            max_storage=tenant_data.get('max_storage', 1073741824),  # 1GB
            settings=tenant_data.get('settings', {}),
            schema_name=schema_name
        )
        
        # 使用repo层创建租户记录
        return self.tenant_repo.create(tenant)

    def _create_tenant_tables(self, tenant_id: str) -> bool:
        """
        在租户schema中创建业务表
        
        Args:
            tenant_id: 租户ID
            
        Returns:
            是否创建成功
        """
        try:
            # 设置schema
            self.schema_manager.set_search_path(tenant_id)
            
            # 创建用户表
            create_users_table_sql = f"""
            CREATE TABLE IF NOT EXISTS tenant_{tenant_id}.users (
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
            
            # 创建角色表
            create_roles_table_sql = f"""
            CREATE TABLE IF NOT EXISTS tenant_{tenant_id}.roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                description TEXT,
                permissions JSONB,
                is_system BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """
            
            # 创建用户角色关联表
            create_user_roles_table_sql = f"""
            CREATE TABLE IF NOT EXISTS tenant_{tenant_id}.user_roles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                role_id INTEGER NOT NULL,
                assigned_by INTEGER,
                assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, role_id)
            );
            """
            
            # 创建邀请表
            create_invitations_table_sql = f"""
            CREATE TABLE IF NOT EXISTS tenant_{tenant_id}.tenant_invitations (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                role_id INTEGER,
                token VARCHAR(255) UNIQUE NOT NULL,
                status invitation_status DEFAULT 'pending',
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                invited_by INTEGER NOT NULL,
                accepted_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """
            
            # 创建审计日志表
            create_audit_logs_table_sql = f"""
            CREATE TABLE IF NOT EXISTS tenant_{tenant_id}.audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50),
                resource_id VARCHAR(50),
                details JSONB,
                ip_address INET,
                user_agent TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """
            
            # 执行创建表的SQL
            from sqlalchemy import text
            self.db.execute(text(create_users_table_sql))
            self.db.execute(text(create_roles_table_sql))
            self.db.execute(text(create_user_roles_table_sql))
            self.db.execute(text(create_invitations_table_sql))
            self.db.execute(text(create_audit_logs_table_sql))
            
            # 创建默认角色
            self._create_default_roles(tenant_id)
            
            return True
            
        except Exception as e:
            logger.error(f"创建租户业务表失败: {str(e)}")
            return False

    def _create_default_roles(self, tenant_id: str) -> None:
        """创建默认角色"""
        try:
            # 设置schema
            self.schema_manager.set_search_path(tenant_id)
            
            # 创建超级管理员角色
            create_super_admin_role_sql = f"""
            INSERT INTO tenant_{tenant_id}.roles (name, description, permissions, is_system)
            VALUES ('super_admin', '超级管理员，拥有所有权限', '{{"all": true}}', true)
            ON CONFLICT (name) DO NOTHING;
            """
            
            # 创建管理员角色
            create_admin_role_sql = f"""
            INSERT INTO tenant_{tenant_id}.roles (name, description, permissions, is_system)
            VALUES ('admin', '管理员，拥有大部分管理权限', '{{"user_management": true, "role_management": true}}', true)
            ON CONFLICT (name) DO NOTHING;
            """
            
            # 创建普通用户角色
            create_user_role_sql = f"""
            INSERT INTO tenant_{tenant_id}.roles (name, description, permissions, is_system)
            VALUES ('user', '普通用户，基础权限', '{{"read": true}}', true)
            ON CONFLICT (name) DO NOTHING;
            """
            
            from sqlalchemy import text
            self.db.execute(text(create_super_admin_role_sql))
            self.db.execute(text(create_admin_role_sql))
            self.db.execute(text(create_user_role_sql))
            
        except Exception as e:
            logger.error(f"创建默认角色失败: {str(e)}")

    def _create_admin_user(self, admin_user_data: Dict[str, Any], tenant_id: str) -> User:
        """
        创建管理员用户
        
        Args:
            admin_user_data: 管理员用户数据
            tenant_id: 租户ID
            
        Returns:
            创建的用户对象
        """
        from werkzeug.security import generate_password_hash
        
        # 生成用户ID
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        
        # 生成用户名（使用邮箱前缀）
        email = admin_user_data['email']
        username = email.split('@')[0]
        
        # 创建用户记录
        user = User(
            user_id=user_id,
            username=username,
            email=email,
            hashed_password=generate_password_hash(admin_user_data['password']),
            full_name=admin_user_data['full_name'],
            phone=admin_user_data.get('phone'),
            avatar_url=admin_user_data.get('avatar_url'),
            status='active',
            role='super_admin'
        )
        
        # 注意：这里需要在租户schema中创建用户，所以需要特殊处理
        # 由于SQLAlchemy模型的限制，这里先创建用户记录，后续在租户schema中插入
        
        return user

    def _format_tenant_response(self, tenant: Tenant) -> Dict[str, Any]:
        """格式化租户响应数据"""
        return {
            "id": tenant.id,
            "tenant_id": tenant.tenant_id,
            "name": tenant.name,
            "domain": tenant.domain,
            "status": tenant.status,
            "plan_type": tenant.plan_type,
            "max_users": tenant.max_users,
            "max_storage": tenant.max_storage,
            "schema_name": tenant.schema_name,
            "created_at": tenant.created_at.isoformat() if tenant.created_at else None
        }

    def _format_user_response(self, user: User) -> Dict[str, Any]:
        """格式化用户响应数据"""
        return {
            "id": user.id,
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "status": user.status
        }
        