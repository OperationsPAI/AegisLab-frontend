import { Outlet } from 'react-router-dom';

import { Layout } from 'antd';

import { useThemeStore } from '@/store/theme';

import AppHeader from './AppHeader';
import MainSidebarContent from './MainSidebarContent';

import './MainLayout.css';

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();

  return (
    <Layout className='main-layout'>
      <AppHeader
        sidebarMode='toggle'
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <Layout className='main-layout-body'>
        {/* Fixed Sidebar */}
        <Sider
          width={240}
          collapsed={sidebarCollapsed}
          collapsedWidth={0}
          className='main-sidebar'
          trigger={null}
          style={{ overflow: 'hidden' }}
        >
          <MainSidebarContent />
        </Sider>

        {/* Main Content */}
        <Content
          className='main-content'
          style={{ marginLeft: sidebarCollapsed ? 0 : 240 }}
        >
          <div className='content-inner'>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
