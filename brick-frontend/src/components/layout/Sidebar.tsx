/**
 * 侧边栏组件
 */

import { Layout, Menu, Typography } from 'antd';
import { 
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, useLocation } from '@tanstack/react-router';
import { MenuItem } from '../../types/common';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed?: boolean;
  userRole?: string;
}

export function Sidebar({ collapsed = false, userRole = 'user' }: SidebarProps) {
  const location = useLocation();

  // 根据用户角色生成菜单项
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        key: '/dashboard',
        label: <Link to="/dashboard">仪表板</Link>,
        icon: <DashboardOutlined />,
        path: '/dashboard',
      },
    ];

    // 超级管理员菜单
    if (userRole === 'super_admin') {
      baseItems.push(
        {
          key: '/tenant/list',
          label: <Link to="/tenant/list">租户管理</Link>,
          icon: <BankOutlined />,
          path: '/tenant/list',
        },
        {
          key: '/users',
          label: <Link to="/users">用户管理</Link>,
          icon: <TeamOutlined />,
          path: '/users',
        }
      );
    }

    // 租户管理员和普通用户菜单
    if (userRole === 'tenant_admin' || userRole === 'user') {
      baseItems.push(
        {
          key: '/dashboard/users',
          label: <Link to="/dashboard/users">用户管理</Link>,
          icon: <TeamOutlined />,
          path: '/dashboard/users',
        },
        {
          key: '/dashboard/settings',
          label: <Link to="/dashboard/settings">租户设置</Link>,
          icon: <SettingOutlined />,
          path: '/dashboard/settings',
        }
      );
    }

    // 通用菜单
    baseItems.push(
      {
        key: '/users/profile',
        label: <Link to="/users/profile">个人资料</Link>,
        icon: <UserOutlined />,
        path: '/users/profile',
      },
      {
        key: '/users/settings',
        label: <Link to="/users/settings">个人设置</Link>,
        icon: <SettingOutlined />,
        path: '/users/settings',
      }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    const selectedKeys: string[] = [];
    
    // 精确匹配
    const exactMatch = menuItems.find(item => item.path === pathname);
    if (exactMatch) {
      selectedKeys.push(exactMatch.key);
    } else {
      // 模糊匹配（用于子路由）
      const fuzzyMatch = menuItems.find(item => 
        item.path && pathname.startsWith(item.path)
      );
      if (fuzzyMatch) {
        selectedKeys.push(fuzzyMatch.key);
      }
    }
    
    return selectedKeys;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
      width={240}
      collapsedWidth={80}
    >
      {/* Logo区域 */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        {collapsed ? (
          <Text strong style={{ fontSize: 20, color: '#1890ff' }}>B</Text>
        ) : (
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
            Brick Platform
          </Text>
        )}
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        style={{
          border: 'none',
          background: '#fff',
        }}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
      />
    </Sider>
  );
}
