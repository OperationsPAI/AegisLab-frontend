import { useMemo } from 'react';

import { Skeleton, Tooltip, Typography } from 'antd';

import type { ActivityContribution } from '@/types/api';

import './ActivityGraph.css';

const { Text } = Typography;

interface ActivityGraphProps {
  contributions: ActivityContribution[];
  isLoading?: boolean;
}

/**
 * Get the activity level (0-4) based on count
 */
function getActivityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

/**
 * Format date for tooltip display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get month labels for the graph
 */
function getMonthLabels(): string[] {
  const months: string[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short' }));
  }

  return months;
}

const ActivityGraph = ({ contributions, isLoading }: ActivityGraphProps) => {
  // Organize contributions into weeks (7 rows × 53 columns)
  const weeks = useMemo(() => {
    if (!contributions.length) return [];

    // Create a map for quick lookup
    const contributionMap = new Map<string, number>();
    contributions.forEach((c) => {
      contributionMap.set(c.date, c.count);
    });

    // Get the last 365 days organized by week
    const result: Array<Array<{ date: string; count: number }>> = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Adjust to start from Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let currentWeek: Array<{ date: string; count: number }> = [];

    for (let i = 0; i < 371; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      currentWeek.push({
        date: dateStr,
        count: contributionMap.get(dateStr) || 0,
      });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [contributions]);

  const totalRuns = useMemo(() => {
    return contributions.reduce((sum, c) => sum + c.count, 0);
  }, [contributions]);

  const monthLabels = useMemo(() => getMonthLabels(), []);

  if (isLoading) {
    return (
      <div className='activity-graph'>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  return (
    <div className='activity-graph'>
      <div className='activity-header'>
        <Text strong>{totalRuns} runs in the last year</Text>
      </div>

      <div className='activity-container'>
        {/* Month labels */}
        <div className='month-labels'>
          {monthLabels.map((month, idx) => (
            <span key={idx} className='month-label'>
              {month}
            </span>
          ))}
        </div>

        {/* Graph grid */}
        <div className='activity-grid-wrapper'>
          {/* Day labels */}
          <div className='day-labels'>
            <span className='day-label'>Mon</span>
            <span className='day-label'>Wed</span>
            <span className='day-label'>Fri</span>
          </div>

          {/* Activity grid */}
          <div className='activity-grid'>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className='activity-week'>
                {week.map((day, dayIdx) => (
                  <Tooltip
                    key={dayIdx}
                    title={`${day.count} runs on ${formatDate(day.date)}`}
                  >
                    <div
                      className={`activity-cell level-${getActivityLevel(day.count)}`}
                    />
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className='activity-legend'>
        <Text type='secondary'>Less</Text>
        <div className='legend-cells'>
          <div className='activity-cell level-0' />
          <div className='activity-cell level-1' />
          <div className='activity-cell level-2' />
          <div className='activity-cell level-3' />
          <div className='activity-cell level-4' />
        </div>
        <Text type='secondary'>More</Text>
      </div>
    </div>
  );
};

export default ActivityGraph;
