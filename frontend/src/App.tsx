import { Layout } from 'antd';

const { Content } = Layout;

/**
 * 应用根组件
 * 提供全局布局
 */
export function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '20px' }}>
        <div style={{ 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>Brick 多租户平台</h1>
          <p>欢迎使用 Brick 多租户平台！</p>
          <p>前端项目已成功启动！</p>
          <p>后端 API: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">http://localhost:8000/docs</a></p>
        </div>
      </Content>
    </Layout>
  );
}
