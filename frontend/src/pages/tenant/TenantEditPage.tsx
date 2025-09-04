/**
 * 租户编辑页面
 */

import { Typography } from 'antd';
import { useParams } from '@tanstack/react-router';
import { MainLayout } from '../../components/layout';

const { Title, Paragraph } = Typography;

export function TenantEditPage() {
  const { tenantId } = useParams({ from: '/tenant/$tenantId/edit' });

  return (
    <MainLayout>
      <Title level={2}>编辑租户</Title>
      <Paragraph>
        租户ID: {tenantId}
      </Paragraph>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#666'
      }}>
        <p>租户编辑功能正在开发中...</p>
        <p>将提供租户信息编辑表单</p>
      </div>
    </MainLayout>
  );
}
