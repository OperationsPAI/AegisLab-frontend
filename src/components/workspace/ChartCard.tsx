import { useEffect, useMemo, useRef } from 'react';

import { Card, Empty, Typography } from 'antd';
import * as echarts from 'echarts';

import type { ChartSeries } from '@/types/workspace';

import './ChartCard.css';

const { Text } = Typography;

interface ChartCardProps {
  title: string;
  series: ChartSeries[];
  type?: 'line' | 'scatter' | 'bar' | 'area';
  height?: number;
  loading?: boolean;
}

/**
 * Individual chart card component
 * Renders ECharts with provided series data
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  series,
  type = 'line',
  height = 200,
  loading = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Filter visible series
  const visibleSeries = useMemo(
    () => series.filter((s) => s.visible),
    [series]
  );

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart instance
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Configure chart options
    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 300,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12,
        },
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        show: visibleSeries.length > 1,
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 11,
        },
      },
      grid: {
        top: 10,
        right: 10,
        bottom: visibleSeries.length > 1 ? 30 : 10,
        left: 10,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Step',
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 10,
          color: '#999',
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 10,
          color: '#999',
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 10,
          color: '#999',
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
          },
        },
      },
      series: visibleSeries.map((s) => ({
        name: s.runName,
        type: type === 'area' ? 'line' : type,
        data: s.data.map((d) => [d.step, d.value]),
        smooth: type === 'line' || type === 'area',
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: s.color,
        },
        itemStyle: {
          color: s.color,
        },
        areaStyle: type === 'area' ? { opacity: 0.3 } : undefined,
      })),
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visibleSeries, type]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  const hasData = visibleSeries.some((s) => s.data.length > 0);

  return (
    <Card
      className='chart-card'
      size='small'
      title={
        <Text className='chart-card-title' ellipsis>
          {title}
        </Text>
      }
      loading={loading}
    >
      {hasData ? (
        <div ref={chartRef} className='chart-card-content' style={{ height }} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='No data available'
          style={{
            height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        />
      )}
    </Card>
  );
};

export default ChartCard;
