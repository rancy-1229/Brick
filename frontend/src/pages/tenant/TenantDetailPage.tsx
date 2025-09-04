/**
 * 租户详情页面
 */

import { Typography } from 'antd';
import { useParams } from '@tanstack/react-router';
import { MainLayout } from '../../components/layout';

const { Title, Paragraph } = Typography;

export function TenantDetailPage() {
  const { tenantId } = useParams({ from: '/tenant/$tenantId' });

  return (
    <MainLayout>
      <Title level={2}>租户详情</Title>
      <Paragraph>
        租户ID: {tenantId}
      </Paragraph>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#666'
      }}>
        <p>租户详情功能正在开发中...</p>
        <p>将显示租户的详细信息</p>
      </div>
    </MainLayout>
  );
}
