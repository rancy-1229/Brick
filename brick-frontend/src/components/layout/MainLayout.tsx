/**
 * 主布局组件
 */

import { Layout, ConfigProvider } from 'antd';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore, useUIStore } from '../../stores';
import zhCN from 'antd/locale/zh_CN';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
  onLogout?: () => void;
}

export function MainLayout({ 
  children, 
  showSidebar = true,
  user,
  onLogout 
}: MainLayoutProps) {
  const { user: authUser, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const handleToggle = () => {
    toggleSidebar();
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
      window.location.href = '/login';
    }
  };

  // 使用认证状态中的用户信息，如果没有则使用传入的user
  const currentUser = authUser ? {
    name: authUser.full_name,
    avatar: authUser.avatar_url,
    role: authUser.role,
  } : user;

  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        {showSidebar && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            userRole={currentUser?.role}
          />
        )}
        
        <Layout>
          <Header
            collapsed={sidebarCollapsed}
            onToggle={showSidebar ? handleToggle : undefined}
            user={currentUser}
            onLogout={handleLogout}
          />
          
          <Content
            style={{
              margin: '16px',
              padding: '24px',
              background: '#fff',
              borderRadius: '8px',
              minHeight: 'calc(100vh - 112px)',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
