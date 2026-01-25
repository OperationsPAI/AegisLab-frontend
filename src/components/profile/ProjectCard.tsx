import { useNavigate } from 'react-router-dom';

import {
  ClockCircleOutlined,
  StarFilled,
  StarOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Card, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { ProjectWithStats } from '@/types/api';

import './ProjectCard.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface ProjectCardProps {
  project: ProjectWithStats;
  isStarred?: boolean;
  onToggleStar?: (projectId: number) => void;
}

const ProjectCard = ({
  project,
  isStarred,
  onToggleStar,
}: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${project.name}`);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar?.(project.id);
  };

  const updatedTime = project.updated_at
    ? dayjs(project.updated_at).fromNow()
    : 'Never';

  return (
    <Card className='project-card' hoverable onClick={handleClick}>
      <div className='project-card-header'>
        <Text strong className='project-card-name'>
          {project.name}
        </Text>
        <span
          className={`project-card-star ${isStarred ? 'starred' : ''}`}
          onClick={handleStarClick}
        >
          {isStarred ? <StarFilled /> : <StarOutlined />}
        </span>
      </div>

      <div className='project-card-meta'>
        <div className='project-card-meta-item'>
          <ClockCircleOutlined />
          <Text type='secondary'>Last updated {updatedTime}</Text>
        </div>
        <div className='project-card-meta-item'>
          <SyncOutlined />
          <Text type='secondary'>{project.run_count || 0} runs</Text>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
