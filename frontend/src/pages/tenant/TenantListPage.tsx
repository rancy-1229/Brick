/**
 * 租户列表页面
 */

import { Typography } from 'antd';
import { MainLayout } from '../../components/layout';

const { Title, Paragraph } = Typography;

export function TenantListPage() {
  return (
    <MainLayout>
      <Title level={2}>租户列表</Title>
      <Paragraph>
        管理所有租户信息，包括查看、编辑、删除等操作。
      </Paragraph>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#666'
      }}>
        <p>租户列表功能正在开发中...</p>
        <p>需要超级管理员权限</p>
      </div>
    </MainLayout>
  );
}
