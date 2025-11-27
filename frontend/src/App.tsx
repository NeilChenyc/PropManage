import React from 'react';
import { Layout, Menu, Typography, message } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ApartmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { UserProvider, useUser } from './contexts/UserContext';
import UserSwitcher from './components/UserSwitcher';
import PropertyManagement from './pages/Landlord/PropertyManagement';
import LeaseManagement from './pages/Landlord/LeaseManagement';
import Dashboard from './pages/Tenant/Dashboard';
import 'antd/dist/reset.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const LandlordRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/property',
      icon: <ApartmentOutlined />,
      label: '房源管理',
    },
    {
      key: '/leases',
      icon: <FileTextOutlined />,
      label: '合同与账务',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200} style={{ overflow: 'auto' }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderBottom: '1px solid #303030'
        }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>PropManage</Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1
        }}>
          <UserSwitcher />
        </Header>
        <Content style={{
          margin: '24px',
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          <Routes>
            <Route path="/property" element={<PropertyManagement />} />
            <Route path="/leases" element={<LeaseManagement />} />
            <Route path="/" element={<PropertyManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const TenantRoutes: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        zIndex: 1
      }}>
        <Title level={4} style={{ margin: 0 }}>PropManage</Title>
        <UserSwitcher />
      </Header>
      <Content style={{
        margin: '24px auto',
        padding: 0,
        maxWidth: 1200,
        width: '100%',
        minHeight: 'calc(100vh - 112px)'
      }}>
        <Dashboard />
      </Content>
    </Layout>
  );
};

const AppContent: React.FC = () => {
  const { role, tenantId } = useUser();

  React.useEffect(() => {
    // 检查租客模式下是否选择了租客
    if (role === 'tenant' && !tenantId) {
      message.info('请选择租客以继续');
    }
  }, [role, tenantId]);

  if (role === 'landlord') {
    return <LandlordRoutes />;
  } else if (role === 'tenant' && tenantId) {
    return <TenantRoutes />;
  } else if (role === 'tenant') {
    // 租客模式但未选择租客时的占位界面
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Title level={2}>请选择租客</Title>
        <UserSwitcher />
      </div>
    );
  }

  return null;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
