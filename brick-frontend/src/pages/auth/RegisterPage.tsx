/**
 * 用户注册页面
 */

import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space,
  Divider,
  message,
  Row,
  Col,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  LockOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import { useAuthStore } from '../../stores';
import { UserRegisterRequest } from '../../types/user';

const { Title, Paragraph, Text } = Typography;

interface FormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
  agree_terms: boolean;
}

export function RegisterPage() {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const { confirm_password, agree_terms, ...registerData } = values;
      
      const requestData: UserRegisterRequest = {
        ...registerData,
        confirm_password,
      };

      const success = await register(requestData);
      
      if (success) {
        message.success('注册成功！请登录您的账户');
        setRegistered(true);
      } else {
        message.error('注册失败，请检查输入信息');
      }
      
            } catch (error: any) {
          console.error('注册失败:', error);
          if (error.message?.includes('认证API暂未实现')) {
            message.warning('用户注册功能暂未实现，请等待后端开发完成');
          } else {
            message.error('注册失败，请稍后重试');
          }
        } finally {
          setLoading(false);
        }
  };

  if (registered) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{ 
          maxWidth: '500px', 
          width: '100%',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={3}>注册成功！</Title>
            <Paragraph>
              您的账户已创建成功，现在可以登录使用 Brick 多租户平台了。
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
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            Brick 多租户平台
          </Title>
          <Paragraph style={{ color: 'white', fontSize: 16 }}>
            创建您的个人账户，加入我们的平台
          </Paragraph>
        </div>

        <Card style={{ 
          borderRadius: 12, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            用户注册
          </Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            autoComplete="off"
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
                    { 
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: '用户名只能包含字母、数字和下划线'
                    }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="请输入用户名"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="full_name"
                  label="真实姓名"
                  rules={[
                    { required: true, message: '请输入真实姓名' },
                    { min: 2, max: 50, message: '姓名长度为2-50个字符' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="请输入真实姓名"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱地址"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="phone"
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
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="password"
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
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="confirm_password"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
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
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="agree_terms"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) => 
                    value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议'))
                }
              ]}
            >
              <Checkbox>
                我已阅读并同意 
                <a href="#" target="_blank" rel="noopener noreferrer">
                  《用户服务协议》
                </a>
                和
                <a href="#" target="_blank" rel="noopener noreferrer">
                  《隐私政策》
                </a>
              </Checkbox>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                立即注册
              </Button>
            </Form.Item>
          </Form>
          
          <Divider>或</Divider>
          
          <div style={{ textAlign: 'center' }}>
            <Text>
              已有账户？ 
              <Link to="/login" style={{ color: '#1890ff', textDecoration: 'underline' }}>
                立即登录
              </Link>
            </Text>
          </div>
        </Card>
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'white' }}>
            企业用户？ 
            <Link to="/tenant/register" style={{ color: 'white', textDecoration: 'underline' }}>
              注册租户账户
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
