/**
 * 登录页面
 */

import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider,
  message,
  Checkbox,
  Row,
  Col
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../stores';
import { UserLoginRequest } from '../../types/user';

const { Title, Paragraph, Text } = Typography;

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

export function LoginPage() {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const requestData: UserLoginRequest = {
        email: values.email,
        password: values.password,
        remember: values.remember,
      };

      const success = await login(requestData.email, requestData.password, requestData.remember);
      
      if (success) {
        message.success('登录成功！');
        // 跳转到仪表板或首页
        navigate({ to: '/dashboard' });
      } else {
        message.error('登录失败，请检查邮箱和密码');
      }
      
            } catch (error: any) {
          console.error('登录失败:', error);
          if (error.message?.includes('认证API暂未实现')) {
            message.warning('认证功能暂未实现，请等待后端开发完成');
          } else {
            message.error('登录失败，请稍后重试');
          }
        } finally {
          setLoading(false);
        }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            Brick 多租户平台
          </Title>
          <Paragraph style={{ color: 'white', fontSize: 16 }}>
            欢迎回来，请登录您的账户
          </Paragraph>
        </div>

        <Card style={{ 
          borderRadius: 12, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            用户登录
          </Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            autoComplete="off"
            initialValues={{ remember: true }}
          >
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
            
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Row justify="space-between" align="middle">
              <Col>
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <a href="#" style={{ color: '#1890ff' }}>
                  忘记密码？
                </a>
              </Col>
            </Row>
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                立即登录
              </Button>
            </Form.Item>
          </Form>
          
          <Divider>或</Divider>
          
          <div style={{ textAlign: 'center' }}>
            <Text>
              还没有账户？ 
              <Link to="/register" style={{ color: '#1890ff', textDecoration: 'underline' }}>
                立即注册
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
