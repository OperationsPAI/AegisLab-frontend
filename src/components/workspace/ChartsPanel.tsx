import { useMemo, useState } from 'react';

import {
  CaretDownOutlined,
  CaretRightOutlined,
  FileAddOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Col, Empty, Input, Row, Space, Typography } from 'antd';

import type { Chart, ChartGroup, RunColors } from '@/types/workspace';

import ChartCard from './ChartCard';

import './ChartsPanel.css';

const { Text } = Typography;

interface ChartsPanelProps {
  charts: Chart[];
  groups: ChartGroup[];
  loading?: boolean;
  runsPanelCollapsed?: boolean;
  onExpandRunsPanel?: () => void;
  onAddPanel?: () => void;
  onAddReport?: () => void;
  onSettings?: () => void;
  // Visibility and color configuration from store
  visibleRuns?: Record<string, boolean>;
  runColors?: RunColors;
}

/**
 * Panel displaying charts organized in collapsible groups
 * Supports search, grouping, and various chart types
 */
const ChartsPanel: React.FC<ChartsPanelProps> = ({
  charts,
  groups,
  loading = false,
  runsPanelCollapsed = false,
  onExpandRunsPanel,
  onAddPanel,
  onAddReport,
  onSettings,
  visibleRuns = {},
  runColors = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // Filter chart series based on visibility and apply colors
  const processedCharts = useMemo(() => {
    return charts.map((chart) => ({
      ...chart,
      series: chart.series
        .filter((s) => {
          // If visibleRuns is provided, filter based on visibility
          if (Object.keys(visibleRuns).length > 0) {
            return visibleRuns[s.runId] ?? false;
          }
          // Otherwise, keep original visibility
          return s.visible;
        })
        .map((s) => ({
          ...s,
          // Apply custom colors if available
          color: runColors[s.runId] || s.color,
          visible: true,
        })),
    }));
  }, [charts, visibleRuns, runColors]);

  // Filter charts based on search
  const filterCharts = (chartIds: string[]) => {
    return chartIds
      .map((id) => processedCharts.find((c) => c.id === id))
      .filter((c): c is Chart => {
        if (!c) return false;
        if (!searchQuery) return true;
        return c.title.toLowerCase().includes(searchQuery.toLowerCase());
      });
  };

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Get charts not in any group
  const ungroupedCharts = processedCharts.filter(
    (c) => !groups.some((g) => g.charts.includes(c.id))
  );

  return (
    <div className='charts-panel'>
      {/* Toolbar */}
      <div className='charts-panel-toolbar'>
        {runsPanelCollapsed && (
          <Button
            type='text'
            icon={<MenuUnfoldOutlined />}
            onClick={onExpandRunsPanel}
            title='Show runs panel'
            style={{ marginRight: 8 }}
          />
        )}
        <Input
          prefix={<SearchOutlined />}
          placeholder='Search panels...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className='charts-panel-search'
        />
        <Space>
          <Button
            type='text'
            icon={<SettingOutlined />}
            onClick={onSettings}
            title='Settings'
          />
          <Button icon={<FileAddOutlined />} onClick={onAddReport}>
            + Report
          </Button>
          <Button type='primary' icon={<PlusOutlined />} onClick={onAddPanel}>
            + Panel
          </Button>
        </Space>
      </div>

      {/* Chart groups */}
      <div className='charts-panel-content'>
        {groups.length === 0 && processedCharts.length === 0 ? (
          <Empty
            description='No charts available'
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Grouped charts */}
            {groups.map((group) => {
              const groupCharts = filterCharts(group.charts);
              const isCollapsed = collapsedGroups[group.id];

              if (groupCharts.length === 0 && searchQuery) return null;

              return (
                <div key={group.id} className='charts-panel-group'>
                  <div
                    className='charts-panel-group-header'
                    onClick={() => toggleGroup(group.id)}
                  >
                    {isCollapsed ? (
                      <CaretRightOutlined />
                    ) : (
                      <CaretDownOutlined />
                    )}
                    <Text strong>{group.name}</Text>
                    <Text type='secondary' style={{ marginLeft: 8 }}>
                      {groupCharts.length}
                    </Text>
                  </div>
                  {!isCollapsed && (
                    <div className='charts-panel-group-content'>
                      {groupCharts.length === 0 ? (
                        <Empty
                          description='No charts in this group'
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Row gutter={[16, 16]}>
                          {groupCharts.map((chart) => (
                            <Col key={chart.id} xs={24} sm={12} lg={8} xl={6}>
                              <ChartCard
                                title={chart.title}
                                series={chart.series}
                                type={chart.type}
                                loading={loading}
                              />
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped charts */}
            {ungroupedCharts.length > 0 && (
              <div className='charts-panel-group'>
                <div
                  className='charts-panel-group-header'
                  onClick={() => toggleGroup('__ungrouped__')}
                >
                  {collapsedGroups['__ungrouped__'] ? (
                    <CaretRightOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )}
                  <Text strong>Other Charts</Text>
                  <Text type='secondary' style={{ marginLeft: 8 }}>
                    {ungroupedCharts.length}
                  </Text>
                </div>
                {!collapsedGroups['__ungrouped__'] && (
                  <div className='charts-panel-group-content'>
                    <Row gutter={[16, 16]}>
                      {ungroupedCharts
                        .filter((c) =>
                          searchQuery
                            ? c.title
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((chart) => (
                          <Col key={chart.id} xs={24} sm={12} lg={8} xl={6}>
                            <ChartCard
                              title={chart.title}
                              series={chart.series}
                              type={chart.type}
                              loading={loading}
                            />
                          </Col>
                        ))}
                    </Row>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChartsPanel;
