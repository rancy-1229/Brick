/**
 * 租户注册页面
 */

import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Row, 
  Col, 
  Typography, 
  Space,
  Divider,
  message,
  Steps
} from 'antd';
import { 
  BankOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import { tenantApi } from '../../services/tenant';
import { TenantCreateRequest } from '../../types/tenant';
import { PlanType, PLAN_TYPE_LABELS } from '../../constants/enums';
import { formatFileSize } from '../../utils/format';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface FormData {
  // 租户信息
  name: string;
  domain?: string;
  plan_type: PlanType;
  max_users: number;
  max_storage: number;
  
  // 管理员信息
  admin_user: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
    confirm_password: string;
  };
}

export function TenantRegisterPage() {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '租户信息',
      description: '填写公司基本信息',
    },
    {
      title: '管理员账户',
      description: '创建管理员账户',
    },
    {
      title: '完成注册',
      description: '确认信息并提交',
    },
  ];

  const handleSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const { confirm_password, ...adminUser } = values.admin_user;
      
      const requestData: TenantCreateRequest = {
        name: values.name,
        domain: values.domain,
        plan_type: values.plan_type,
        max_users: values.max_users,
        max_storage: values.max_storage,
        admin_user: adminUser,
      };

      const response = await tenantApi.registerTenant(requestData);
      
      message.success('租户注册成功！');
      setCurrentStep(2);
      
      // 可以在这里跳转到登录页面或显示成功信息
      console.log('注册成功:', response);
      
    } catch (error) {
      console.error('注册失败:', error);
      message.error('注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      // 验证当前步骤的表单数据
      const fields = currentStep === 0 
        ? ['name'] // 第一步验证公司名称
        : ['admin_user.full_name', 'admin_user.email', 'admin_user.password']; // 第二步验证管理员信息
      
      await form.validateFields(fields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="公司名称"
                rules={[
                  { required: true, message: '请输入公司名称' },
                  { min: 2, max: 100, message: '公司名称长度为2-100个字符' }
                ]}
              >
                <Input 
                  prefix={<BankOutlined />} 
                  placeholder="请输入公司名称"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="domain"
                label="公司域名"
                rules={[
                  { 
                    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
                    message: '请输入有效的域名格式'
                  }
                ]}
              >
                <Input 
                  placeholder="example.com（可选）"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="plan_type"
                label="套餐类型"
                initialValue={PlanType.BASIC}
                rules={[{ required: true, message: '请选择套餐类型' }]}
              >
                <Select size="large">
                  {Object.entries(PLAN_TYPE_LABELS).map(([key, label]) => (
                    <Option key={key} value={key}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="max_users"
                label="最大用户数"
                initialValue={10}
                rules={[
                  { required: true, message: '请输入最大用户数' },
                  { type: 'number', min: 10, max: 10000, message: '用户数范围为10-10000' }
                ]}
              >
                <InputNumber 
                  min={10} 
                  max={10000} 
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="max_storage"
                label="最大存储空间"
                initialValue={1073741824} // 1GB
                rules={[
                  { required: true, message: '请输入最大存储空间' },
                  { type: 'number', min: 1073741824, max: 1099511627776, message: '存储空间范围为1GB-1TB' }
                ]}
              >
                <InputNumber 
                  min={1073741824} 
                  max={1099511627776} 
                  style={{ width: '100%' }}
                  size="large"
                  formatter={(value) => value ? formatFileSize(value) : ''}
                  parser={(value) => {
                    const num = value ? parseInt(value.replace(/[^\d]/g, '')) : 0;
                    return Math.max(1073741824, Math.min(1099511627776, num)) as 1073741824 | 1099511627776;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        );
        
      case 1:
        return (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name={['admin_user', 'full_name']}
                label="管理员姓名"
                rules={[
                  { required: true, message: '请输入管理员姓名' },
                  { min: 2, max: 50, message: '姓名长度为2-50个字符' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入管理员姓名"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name={['admin_user', 'email']}
                label="邮箱地址"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name={['admin_user', 'phone']}
                label="手机号码"
                rules={[
                  { 
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码'
                  }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="请输入手机号码（可选）"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name={['admin_user', 'password']}
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 8, max: 50, message: '密码长度为8-50个字符' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: '密码必须包含大小写字母和数字'
                  }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入密码"
                  size="large"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name={['admin_user', 'confirm_password']}
                label="确认密码"
                dependencies={['admin_user', 'password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue(['admin_user', 'password']) === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请再次输入密码"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        );
        
      case 2:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={3}>注册成功！</Title>
            <Paragraph>
              您的租户账户已创建成功，管理员账户已激活。
            </Paragraph>
            <Space>
              <Link to="/login">
                <Button type="primary" size="large">
                  立即登录
                </Button>
              </Link>
              <Link to="/">
                <Button size="large">
                  返回首页
                </Button>
              </Link>
            </Space>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            Brick 多租户平台
          </Title>
          <Paragraph style={{ color: 'white', fontSize: 16 }}>
            快速注册您的企业账户，开启多租户管理之旅
          </Paragraph>
        </div>

        <Card style={{ borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Steps 
            current={currentStep} 
            items={steps}
            style={{ marginBottom: 32 }}
          />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            {renderStepContent()}
            
            {currentStep < 2 && (
              <>
                <Divider />
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    {currentStep > 0 && (
                      <Button onClick={prevStep} size="large">
                        上一步
                      </Button>
                    )}
                    {currentStep < 1 ? (
                      <Button type="primary" onClick={nextStep} size="large">
                        下一步
                      </Button>
                    ) : currentStep === 1 ? (
                      <Button type="primary" onClick={nextStep} size="large">
                        下一步
                      </Button>
                    ) : (
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        size="large"
                      >
                        完成注册
                      </Button>
                    )}
                  </Space>
                </div>
              </>
            )}
          </Form>
        </Card>
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'white' }}>
            已有账户？ <Link to="/login" style={{ color: 'white', textDecoration: 'underline' }}>立即登录</Link>
          </Text>
        </div>
      </div>
    </div>
  );
}