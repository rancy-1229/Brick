"""
测试租户服务层
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from core.pq_db import SessionLocal
from services.tenant import TenantService

def test_create_tenant():
    """测试创建租户"""
    db: Session = SessionLocal()
    
    try:
        # 创建服务实例
        tenant_service = TenantService(db)
        
        # 测试数据
        tenant_data = {
            "name": "测试科技有限公司",
            "domain": "test.example.com",
            "admin_user": {
                "full_name": "测试管理员",
                "email": "admin@test.example.com",
                "phone": "13800138000",
                "password": "TestPass123!"
            },
            "plan_type": "basic",
            "max_users": 50,
            "max_storage": 10737418240  # 10GB
        }
        
        print("开始创建租户...")
        
        # 创建租户
        result = tenant_service.create_tenant(tenant_data)
        
        print("✅ 租户创建成功！")
        print(f"租户信息: {result['tenant']}")
        print(f"管理员信息: {result['admin_user']}")
        print(f"设置状态: {result['setup_instructions']}")
        
        return result
        
    except Exception as e:
        print(f"❌ 创建租户失败: {str(e)}")
        raise e
        
    finally:
        db.close()

def test_get_tenant():
    """测试获取租户"""
    db: Session = SessionLocal()
    
    try:
        tenant_service = TenantService(db)
        
        # 获取租户列表
        tenants = tenant_service.list_tenants(page=1, size=10)
        print(f"✅ 获取租户列表成功，共 {tenants['pagination']['total']} 个租户")
        
        if tenants['tenants']:
            first_tenant = tenants['tenants'][0]
            print(f"第一个租户: {first_tenant['name']} ({first_tenant['tenant_id']})")
            
            # 根据ID获取租户详情
            tenant_detail = tenant_service.get_tenant(first_tenant['tenant_id'])
            if tenant_detail:
                print(f"✅ 获取租户详情成功: {tenant_detail.name}")
            else:
                print("❌ 获取租户详情失败")
        
    except Exception as e:
        print(f"❌ 获取租户失败: {str(e)}")
        raise e
        
    finally:
        db.close()

if __name__ == "__main__":
    print("=== 租户服务层测试 ===")
    
    try:
        # 测试创建租户
        print("\n1. 测试创建租户")
        test_create_tenant()
        
        # 测试获取租户
        print("\n2. 测试获取租户")
        test_get_tenant()
        
        print("\n🎉 所有测试通过！")
        
    except Exception as e:
        print(f"\n💥 测试失败: {str(e)}")
        sys.exit(1)
