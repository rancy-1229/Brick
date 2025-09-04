/**
 * 仪表板页面
 */

import { Card, Typography, Row, Col, Statistic } from 'antd';
import { UserOutlined, DatabaseOutlined, ApiOutlined, DollarOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/layout';

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  return (
    <MainLayout>
      <Title level={2}>仪表板</Title>
      <Paragraph>
        欢迎使用 Brick 多租户平台仪表板！
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="存储使用"
              value={93}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="API调用"
              value={112893}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月费用"
              value={1128}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '20px' }}>
        <Title level={3}>功能开发中</Title>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <p>更多仪表板功能正在开发中...</p>
          <p>包括图表、统计、监控等功能</p>
        </div>
      </Card>
    </MainLayout>
  );
}
