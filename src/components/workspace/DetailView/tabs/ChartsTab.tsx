import { Col, Empty, Row } from 'antd';

import ChartCard from '@/components/workspace/ChartCard';
import type { Chart } from '@/types/workspace';

interface ChartsTabProps {
  charts: Chart[];
  loading?: boolean;
}

/**
 * Charts tab component for visualizing metrics
 */
const ChartsTab: React.FC<ChartsTabProps> = ({ charts, loading = false }) => {
  if (!charts || charts.length === 0) {
    return (
      <div className='charts-tab-empty'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='No charts available for this run'
        />
      </div>
    );
  }

  return (
    <div className='charts-tab'>
      <Row gutter={[16, 16]}>
        {charts.map((chart) => (
          <Col key={chart.id} xs={24} md={12} xl={8}>
            <ChartCard
              title={chart.title}
              series={chart.series}
              type={chart.type}
              height={250}
              loading={loading}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ChartsTab;
