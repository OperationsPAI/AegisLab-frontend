import { Link, useLocation } from 'react-router-dom';

import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import { Breadcrumb as AntBreadcrumb } from 'antd';

import './Breadcrumb.css';

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  projectName?: string;
  teamName?: string;
}

/**
 * Dynamic breadcrumb navigation component
 * Automatically generates breadcrumb based on current path or custom items
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  projectName,
  teamName,
}) => {
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Path mappings for readable names
    const pathNameMap: Record<string, string> = {
      home: 'Home',
      projects: 'Projects',
      workspace: 'Workspace',
      injections: 'Injections',
      executions: 'Executions',
      artifacts: 'Artifacts',
      settings: 'Settings',
      create: 'Create',
      new: 'New',
      edit: 'Edit',
      admin: 'Admin',
      dashboard: 'Dashboard',
      containers: 'Containers',
      datasets: 'Datasets',
      datapacks: 'Datapacks',
      evaluations: 'Evaluations',
      tasks: 'Tasks',
      system: 'System',
      profile: 'Profile',
    };

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Check if this segment is a project name (comes right after root in /:projectName routes)
      const isProjectName =
        index === 0 &&
        !pathNameMap[segment] &&
        !segment.match(/^\d+$/) &&
        segment !== 'admin';

      // Check if this is a dynamic ID
      const isId = segment.match(/^\d+$/);

      if (isProjectName && projectName) {
        // For project pages, generate wandb-style breadcrumb: teamName > Projects > projectName > page
        if (teamName) {
          // Add team name at the beginning (if not already added)
          if (breadcrumbItems.length === 0) {
            breadcrumbItems.push({
              title: teamName,
              path: teamName === 'Personal' ? '/profile' : `/${teamName}`,
            });
          }

          // Add "Projects" link
          breadcrumbItems.push({
            title: 'Projects',
            path: `/${teamName}/projects`,
          });
        }

        // Add project name
        breadcrumbItems.push({
          title: projectName,
          path: currentPath,
        });
      } else if (isId) {
        // Skip numeric IDs or show as detail
        breadcrumbItems.push({
          title: `#${segment}`,
          path: currentPath,
        });
      } else {
        const title = pathNameMap[segment] || segment;
        const isLast = index === pathSegments.length - 1;

        breadcrumbItems.push({
          title,
          path: isLast ? undefined : currentPath,
        });
      }
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  // Convert to Ant Design breadcrumb format
  const antBreadcrumbItems = [
    {
      title: (
        <Link to='/home'>
          <HomeOutlined />
        </Link>
      ),
    },
    ...breadcrumbItems.map((item) => ({
      title: item.path ? (
        <Link to={item.path}>
          {item.icon}
          {item.title}
        </Link>
      ) : (
        <span>
          {item.icon}
          {item.title}
        </span>
      ),
    })),
  ];

  return (
    <AntBreadcrumb
      className='app-breadcrumb'
      separator={<RightOutlined style={{ fontSize: '10px' }} />}
      items={antBreadcrumbItems}
    />
  );
};

export default Breadcrumb;
