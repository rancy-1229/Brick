/**
 * 页面头部组件
 */

import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Link } from '@tanstack/react-router';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
  onLogout?: () => void;
}

export function Header({ 
  collapsed = false, 
  onToggle, 
  user,
  onLogout 
}: HeaderProps) {
  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/users/profile">个人资料</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/users/settings">设置</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        padding: '0 16px', 
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* 左侧：折叠按钮和标题 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {onToggle && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{ marginRight: 16 }}
          />
        )}
        <Text strong style={{ fontSize: 18 }}>
          Brick 多租户平台
        </Text>
      </div>

      {/* 右侧：通知和用户信息 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Space size="middle">
          {/* 通知铃铛 */}
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            style={{ fontSize: 16 }}
          />
          
          {/* 用户信息 */}
          {user ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background-color 0.2s'
              }}>
                <Avatar 
                  src={user.avatar} 
                  icon={<UserOutlined />}
                  style={{ marginRight: 8 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {user.role}
                  </div>
                </div>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="text">登录</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            </Space>
          )}
        </Space>
      </div>
    </AntHeader>
  );
}
