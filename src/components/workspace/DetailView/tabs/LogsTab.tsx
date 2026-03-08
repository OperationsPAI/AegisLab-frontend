import { LogViewer } from './LogViewer';
import PipelineLogsViewer from './PipelineLogsViewer';

import './LogsTab.css';

interface LogsTabBaseProps {
  /** Task ID for plain LogViewer (execution mode) */
  taskId?: string;
  loading?: boolean;
}

interface ExecutionLogsTabProps extends LogsTabBaseProps {
  /** Execution mode: plain LogViewer without pipeline Steps */
  mode: 'execution';
  traceId: string;
}

interface InjectionLogsTabProps extends LogsTabBaseProps {
  /** Task mode: PipelineLogsViewer with Steps navigation */
  mode: 'injection';
  traceId?: string;
}

type LogsTabProps = ExecutionLogsTabProps | InjectionLogsTabProps;

/**
 * Logs tab component
 * - mode='execution': Plain LogViewer with WebSocket streaming (needs taskId)
 * - mode='injection': PipelineLogsViewer with Steps navigation (needs traceId)
 */
const LogsTab: React.FC<LogsTabProps> = ({
  taskId,
  loading = false,
  mode = 'injection',
  traceId,
}) => {
  // Injection mode: render PipelineLogsViewer with Steps navigation
  if (mode === 'injection') {
    return (
      <div className='logs-tab'>
        {traceId ? (
          <PipelineLogsViewer traceId={traceId} loading={loading} />
        ) : (
          <LogViewer loading={loading} />
        )}
      </div>
    );
  }

  // Execution mode: render plain LogViewer with WebSocket
  return (
    <div className='logs-tab'>
      <LogViewer taskId={taskId} loading={loading} />
    </div>
  );
};

export default LogsTab;
