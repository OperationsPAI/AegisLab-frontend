import { ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, type MenuProps } from 'antd';

import type { DetailViewAction } from './DetailView';

interface DetailViewHeaderProps {
  title: string;
  titleDotColor: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  actions?: DetailViewAction[];
}

/**
 * Header component for DetailView
 * Styled similar to WorkspacePageHeader
 * Contains: Back icon | Status dot + Title + Status Tag | Actions dropdown
 */
const DetailViewHeader: React.FC<DetailViewHeaderProps> = ({
  title,
  titleDotColor,
  onBack,
  backLabel = 'Back',
  actions = [],
}) => {
  // Convert actions to dropdown menu items
  const menuItems: MenuProps['items'] = actions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
    onClick: action.onClick,
  }));

  return (
    <div className='detail-view-header'>
      <div className='detail-view-header-left'>
        {/* Back icon - styled like workspace-toggle-btn */}
        <Button
          type='text'
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className='detail-view-back-btn'
          title={backLabel}
        />

        {/* Status dot + Name container */}
        <div className='detail-view-name-container'>
          <span
            className='detail-view-status-dot'
            style={{ backgroundColor: titleDotColor }}
          />
          <span className='detail-view-name'>{title}</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div className='detail-view-header-right'>
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement='bottomRight'
          >
            <Button
              type='text'
              icon={<MoreOutlined />}
              className='detail-view-more-btn'
            />
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default DetailViewHeader;
