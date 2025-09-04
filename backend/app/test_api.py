"""
测试API接口
"""
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """测试健康检查接口"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"✅ 健康检查: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False

def test_tenant_registration():
    """测试租户注册接口"""
    try:
        # 准备测试数据
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
        
        # 发送POST请求
        response = requests.post(
            f"{BASE_URL}/tenants/register",
            json=tenant_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ 租户注册: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"   租户ID: {result['data']['tenant']['tenant_id']}")
            print(f"   租户名称: {result['data']['tenant']['name']}")
            print(f"   Schema名称: {result['data']['tenant']['schema_name']}")
            return result['data']['tenant']['tenant_id']
        else:
            print(f"   错误: {response.json()}")
            return None
            
    except Exception as e:
        print(f"❌ 租户注册失败: {e}")
        return None

def test_get_tenant_list():
    """测试获取租户列表接口"""
    try:
        response = requests.get(f"{BASE_URL}/tenants/")
        print(f"✅ 获取租户列表: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   总租户数: {result['data']['pagination']['total']}")
            if result['data']['tenants']:
                first_tenant = result['data']['tenants'][0]
                print(f"   第一个租户: {first_tenant['name']} ({first_tenant['tenant_id']})")
            return True
        else:
            print(f"   错误: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ 获取租户列表失败: {e}")
        return False

def test_get_tenant_detail(tenant_id: str):
    """测试获取租户详情接口"""
    try:
        response = requests.get(f"{BASE_URL}/tenants/{tenant_id}")
        print(f"✅ 获取租户详情: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   租户名称: {result['data']['name']}")
            print(f"   状态: {result['data']['status']}")
            print(f"   套餐: {result['data']['plan_type']}")
            return True
        else:
            print(f"   错误: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ 获取租户详情失败: {e}")
        return False

def test_invalid_tenant_registration():
    """测试无效的租户注册（验证错误处理）"""
    try:
        # 准备无效的测试数据（缺少必填字段）
        invalid_data = {
            "name": "",  # 空名称
            "admin_user": {
                "full_name": "测试",
                "email": "invalid-email",  # 无效邮箱
                "password": "123"  # 密码太短
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/tenants/register",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ 无效注册测试: {response.status_code}")
        
        if response.status_code == 400:
            print("   正确返回400错误")
            return True
        else:
            print(f"   意外状态码: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 无效注册测试失败: {e}")
        return False

if __name__ == "__main__":
    print("=== API接口测试 ===\n")
    
    # 1. 健康检查
    print("1. 测试健康检查接口")
    if not test_health_check():
        print("❌ 服务可能未启动，请先启动FastAPI服务")
        exit(1)
    
    print("\n" + "="*50 + "\n")
    
    # 2. 测试租户注册
    print("2. 测试租户注册接口")
    tenant_id = test_tenant_registration()
    
    print("\n" + "="*50 + "\n")
    
    # 3. 测试获取租户列表
    print("3. 测试获取租户列表接口")
    test_get_tenant_list()
    
    print("\n" + "="*50 + "\n")
    
    # 4. 测试获取租户详情
    if tenant_id:
        print("4. 测试获取租户详情接口")
        test_get_tenant_detail(tenant_id)
    
    print("\n" + "="*50 + "\n")
    
    # 5. 测试错误处理
    print("5. 测试错误处理")
    test_invalid_tenant_registration()
    
    print("\n🎉 API接口测试完成！")
    print("\n💡 提示：")
    print("   - 访问 http://localhost:8000/docs 查看API文档")
    print("   - 访问 http://localhost:8000/redoc 查看详细文档")
    print("   - 使用 uvicorn main:app --reload 启动服务")
