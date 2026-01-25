import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  ApiOutlined,
  BarChartOutlined,
  BulbOutlined,
  CloudServerOutlined,
  ContainerOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FolderOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ProjectResp } from '@rcabench/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  type MenuProps,
  message,
  Space,
  Switch,
  Typography,
} from 'antd';

import { projectApi } from '@/api/projects';
import { teamApi } from '@/api/teams';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';

import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Drawer states
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [projectForm] = Form.useForm();
  const [teamForm] = Form.useForm();

  // Fetch recent projects for sidebar
  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'sidebar'],
    queryFn: () => projectApi.getProjects({ page: 1, size: 5 }),
  });

  // Fetch teams for sidebar
  const { data: teamsData } = useQuery({
    queryKey: ['teams', 'sidebar'],
    queryFn: () => teamApi.getTeams(),
  });

  const recentProjects = useMemo(
    () => projectsData?.items || [],
    [projectsData?.items]
  );

  const teams = useMemo(() => teamsData || [], [teamsData]);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (data) => {
      message.success('Project created successfully');
      setProjectDrawerOpen(false);
      projectForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (data?.name) {
        navigate(`/${data.name}`);
      }
    },
    onError: () => {
      message.error('Failed to create project');
    },
  });

  // Check if we're in admin section
  const isAdminSection = location.pathname.startsWith('/admin');

  // User section menu items (wandb-style flat layout)
  const userSidebarItems: MenuProps['items'] = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      type: 'divider',
      style: { margin: '12px 0 8px' },
    },
    // Projects section header (non-clickable)
    {
      key: 'projects-header',
      type: 'group',
      label: (
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 8px',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Projects
          </span>
          <Button
            type='link'
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              navigate('/profile?tab=projects');
            }}
            style={{ padding: 0, fontSize: 12, height: 'auto' }}
          >
            View all
          </Button>
        </span>
      ),
    },
    {
      key: 'action:create-project',
      icon: <PlusOutlined />,
      label: 'Create a new project',
    },
    ...recentProjects.map((project: ProjectResp) => ({
      key: `/projects/${project.name}`,
      icon: <FolderOutlined />,
      label: project.name,
    })),
    {
      type: 'divider',
      style: { margin: '12px 0 8px' },
    },
    // Teams section header (non-clickable)
    {
      key: 'teams-header',
      type: 'group',
      label: (
        <span
          style={{
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            padding: '0 8px',
          }}
        >
          Teams
        </span>
      ),
    },
    // Teams list
    ...teams.map((team) => ({
      key: `/teams/${team.name}`,
      icon: <TeamOutlined />,
      label: team.display_name || team.name,
    })),
    {
      key: 'action:create-team',
      icon: <PlusOutlined />,
      label: 'Create a team to collaborate',
    },
  ];

  // Admin section menu items (original navigation with /admin prefix)
  const adminSidebarItems: MenuProps['items'] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      type: 'divider',
      style: { margin: '8px 0' },
    },
    {
      key: 'experiments',
      icon: <ExperimentOutlined />,
      label: 'Experiments',
      children: [
        {
          key: '/admin/projects',
          icon: <ProjectOutlined />,
          label: 'Projects',
        },
        {
          key: '/admin/injections',
          icon: <BulbOutlined />,
          label: 'Fault Injections',
        },
        {
          key: '/admin/executions',
          icon: <PlayCircleOutlined />,
          label: 'Algorithm Runs',
        },
      ],
    },
    {
      key: 'infrastructure',
      icon: <CloudServerOutlined />,
      label: 'Infrastructure',
      children: [
        {
          key: '/admin/containers',
          icon: <ContainerOutlined />,
          label: 'Containers',
        },
        {
          key: '/admin/datasets',
          icon: <DatabaseOutlined />,
          label: 'Datasets',
        },
        {
          key: '/admin/datapacks',
          icon: <DatabaseOutlined />,
          label: 'Datapacks',
        },
      ],
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: 'Analysis',
      children: [
        {
          key: '/admin/evaluations',
          icon: <SafetyCertificateOutlined />,
          label: 'Evaluations',
        },
        {
          key: '/admin/tasks',
          icon: <UnorderedListOutlined />,
          label: 'Task Monitor',
        },
      ],
    },
    {
      type: 'divider',
      style: { margin: '8px 0' },
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: 'System',
      children: [
        {
          key: '/admin/system',
          icon: <ApiOutlined />,
          label: 'API & Config',
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
      ],
    },
  ];

  // User dropdown menu
  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'admin',
      icon: <DashboardOutlined />,
      label: 'Admin Panel',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    // Handle drawer actions
    if (key === 'action:create-project') {
      setProjectDrawerOpen(true);
      return;
    }
    if (key === 'action:create-team') {
      setTeamDrawerOpen(true);
      return;
    }
    // Handle navigation
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Update selected keys based on location
  useEffect(() => {
    const path = location.pathname;
    setSelectedKeys([path]);

    if (isAdminSection) {
      // Admin section open keys logic (for expandable submenus)
      if (
        path.startsWith('/admin/projects') ||
        path.startsWith('/admin/injections') ||
        path.startsWith('/admin/executions')
      ) {
        setOpenKeys(['experiments']);
      } else if (
        path.startsWith('/admin/containers') ||
        path.startsWith('/admin/datasets') ||
        path.startsWith('/admin/datapacks')
      ) {
        setOpenKeys(['infrastructure']);
      } else if (
        path.startsWith('/admin/evaluations') ||
        path.startsWith('/admin/tasks')
      ) {
        setOpenKeys(['analysis']);
      } else if (
        path.startsWith('/admin/system') ||
        path.startsWith('/admin/settings')
      ) {
        setOpenKeys(['system']);
      }
    } else {
      // User section: flat layout, just match selected key
      if (path.startsWith('/projects/')) {
        const projectMatch = recentProjects.find((p: ProjectResp) =>
          path.startsWith(`/projects/${p.name}`)
        );
        if (projectMatch) {
          setSelectedKeys([`/projects/${projectMatch.name}`]);
        }
      }
    }
  }, [location.pathname, isAdminSection, recentProjects]);

  const currentMenuItems = isAdminSection
    ? adminSidebarItems
    : userSidebarItems;

  return (
    <Layout className='main-layout'>
      {/* Header */}
      <Header className='main-header'>
        <div className='header-left'>
          <Button
            type='text'
            icon={
              sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            className='sidebar-toggle'
          />
          <div
            className='logo-section'
            onClick={() =>
              navigate(isAdminSection ? '/admin/dashboard' : '/home')
            }
            style={{ cursor: 'pointer' }}
          >
            <div className='logo-icon'>
              <svg
                width='32'
                height='32'
                viewBox='0 0 32 32'
                fill='none'
                role='img'
                aria-label='AegisLab logo'
              >
                <title>AegisLab</title>
                <path
                  d='M16 2L30 8.5V23.5L16 30L2 23.5V8.5L16 2Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinejoin='round'
                />
                <path
                  d='M16 16L30 8.5M16 16V30M16 16L2 8.5'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinejoin='round'
                  opacity='0.3'
                />
                <circle cx='16' cy='16' r='4' fill='currentColor' />
              </svg>
            </div>
            <div className='logo-text'>
              <span className='logo-title'>AegisLab</span>
              <span className='logo-subtitle'>
                {isAdminSection ? 'Admin Panel' : 'RCA Benchmark Platform'}
              </span>
            </div>
          </div>
        </div>

        <div className='header-right'>
          {/* Mode switcher */}
          {!isAdminSection && (
            <Button
              type='text'
              icon={<DashboardOutlined />}
              onClick={() => navigate('/admin/dashboard')}
              title='Switch to Admin Panel'
            />
          )}
          {isAdminSection && (
            <Button
              type='text'
              icon={<HomeOutlined />}
              onClick={() => navigate('/home')}
              title='Switch to User View'
            />
          )}
          <ThemeToggle />
          <Dropdown
            menu={{ items: userDropdownItems, onClick: handleUserMenuClick }}
            placement='bottomRight'
            arrow
            overlayClassName='user-dropdown'
          >
            <Space
              className='user-section'
              role='button'
              aria-label='User menu'
              tabIndex={0}
            >
              <Avatar
                size='small'
                icon={<UserOutlined />}
                style={{ backgroundColor: 'var(--color-primary-500)' }}
              />
              <Text className='username'>{user?.username || 'User'}</Text>
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Layout className='main-body'>
        {/* Sidebar */}
        <Sider
          width={240}
          collapsed={sidebarCollapsed}
          collapsedWidth={0}
          className='main-sidebar'
          trigger={null}
        >
          {!sidebarCollapsed && (
            <>
              <div className='sidebar-content'>
                <Menu
                  mode='inline'
                  selectedKeys={selectedKeys}
                  openKeys={openKeys}
                  items={currentMenuItems}
                  onClick={handleMenuClick}
                  onOpenChange={handleOpenChange}
                  className='sidebar-menu'
                />
              </div>

              {/* Sidebar Footer */}
              <div className='sidebar-footer'>
                <div className='system-status'>
                  <div className='status-indicator' />
                  <span className='status-text'>System Online</span>
                </div>
              </div>
            </>
          )}
        </Sider>

        {/* Main Content */}
        <Layout className='main-content-wrapper'>
          <Content className='main-content'>
            <div className='content-inner'>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Create Project Drawer */}
      <Drawer
        title='Create New Project'
        open={projectDrawerOpen}
        onClose={() => {
          setProjectDrawerOpen(false);
          projectForm.resetFields();
        }}
        width={400}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setProjectDrawerOpen(false);
                projectForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type='primary'
              loading={createProjectMutation.isPending}
              onClick={() => projectForm.submit()}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Form
          form={projectForm}
          layout='vertical'
          onFinish={(values) => {
            createProjectMutation.mutate(values);
          }}
        >
          <Form.Item
            name='name'
            label='Project Name'
            rules={[
              { required: true, message: 'Please enter a project name' },
              {
                pattern: /^[a-zA-Z0-9_-]+$/,
                message:
                  'Only letters, numbers, underscores and hyphens allowed',
              },
            ]}
          >
            <Input placeholder='my-project' />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <Input.TextArea rows={3} placeholder='Project description...' />
          </Form.Item>
          <Form.Item name='is_public' label='Public' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Create Team Drawer */}
      <Drawer
        title='Create New Team'
        open={teamDrawerOpen}
        onClose={() => {
          setTeamDrawerOpen(false);
          teamForm.resetFields();
        }}
        width={400}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setTeamDrawerOpen(false);
                teamForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type='primary' disabled>
              Create
            </Button>
          </Space>
        }
      >
        <Form form={teamForm} layout='vertical'>
          <Form.Item
            name='name'
            label='Team Name'
            rules={[{ required: true, message: 'Please enter a team name' }]}
          >
            <Input placeholder='my-team' disabled />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <Input.TextArea
              rows={3}
              placeholder='Team description...'
              disabled
            />
          </Form.Item>
        </Form>
        <Text type='secondary'>Team creation is coming soon.</Text>
      </Drawer>
    </Layout>
  );
};

export default MainLayout;
