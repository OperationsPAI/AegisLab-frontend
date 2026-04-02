import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Steps } from 'antd';

import {
  type PipelinePhaseMap,
  type StepPhase,
  useTraceSSE,
} from '@/hooks/useTraceSSE';

import FaultInjectionPanel from './FaultInjectionPanel';
import { LogViewer } from './LogViewer';

import './PipelineLogsViewer.css';

// Re-export types for external consumers
export type { StepPhase } from '@/hooks/useTraceSSE';

export interface PhaseStep {
  key: StepPhase;
  title: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  subTitle?: string;
}

interface PipelineLogsViewerProps {
  traceId: string;
  loading?: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<StepPhase, string> = {
  fault_injection: 'Fault Injection',
  datapack_building: 'Datapack Building',
  detector: 'Detector',
};

const PHASES: readonly StepPhase[] = [
  'fault_injection',
  'datapack_building',
  'detector',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format seconds into human-readable duration like "1m30s" */
const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString();
  const s = Math.floor(seconds % 60).toString();
  if (m === '0') return `${s}s`;
  if (s === '0') return `${m}m`;
  return `${m}m${s}s`;
};

/**
 * Build subtitle text for a phase step.
 *   - process  → live elapsed timer (now − startTime)
 *   - error    → "failed"
 *   - finish   → formatted duration (endTime − startTime)
 *   - wait     → undefined
 */
const buildSubTitle = (
  status: PhaseStep['status'],
  startTime?: number,
  endTime?: number,
  now?: number
): string | undefined => {
  if (status === 'process' && startTime != null && now != null) {
    const elapsed = Math.floor((now - startTime) / 1000);
    return formatDuration(Math.max(0, elapsed));
  }
  if (status === 'process') return '0s';
  if (status === 'error') return 'failed';
  if (status === 'finish' && startTime != null && endTime != null) {
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    return formatDuration(durationSeconds);
  }
  return undefined;
};

/**
 * Derive phase steps purely from SSE real-time data.
 * `now` drives the live elapsed timer for in-progress phases.
 */
const derivePhaseSteps = (
  ssePhases: PipelinePhaseMap,
  now: number
): PhaseStep[] =>
  PHASES.map((phaseKey) => {
    const phase = ssePhases[phaseKey];
    // Debug: deriving step for phase
    return {
      key: phaseKey,
      title: PHASE_LABELS[phaseKey],
      status: phase.status,
      subTitle: buildSubTitle(
        phase.status,
        phase.startTime,
        phase.endTime,
        now
      ),
    };
  });

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Pipeline Logs Viewer with Steps navigation bar.
 *
 * - **Fault Injection**: FaultInjectionPanel (placeholder)
 * - **Datapack Building**: LogViewer (WebSocket log stream)
 * - **Detector**: LogViewer (WebSocket log stream)
 *
 * Uses SSE (`/api/v2/traces/{id}/stream`) exclusively for real-time
 * phase tracking, task ID resolution, and duration calculation:
 *   • `datapack.build.started`  → opens WebSocket for Datapack logs
 *   • `algorithm.run.started`   → opens WebSocket for Detector logs
 *   • Duration ticks live while in-progress, freezes on completion.
 */
const PipelineLogsViewer: React.FC<PipelineLogsViewerProps> = ({
  traceId,
  loading = false,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // ── SSE: real-time pipeline phase tracking ──────────────────────────────
  const { phases: ssePhases } = useTraceSSE(traceId);

  // ── Live timer: ticks every second while any phase is 'process' ─────────
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasRunningPhase = useMemo(
    () => PHASES.some((key) => ssePhases[key].status === 'process'),
    [ssePhases]
  );

  useEffect(() => {
    if (hasRunningPhase) {
      // Start ticking every second
      setNow(Date.now());
      timerRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1_000);
    } else if (timerRef.current) {
      // Stop ticking when no phase is running
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasRunningPhase]);

  // ── Derived data ────────────────────────────────────────────────────────

  /** Phase step descriptors for the Steps navigation bar */
  const phaseSteps = useMemo(
    () => derivePhaseSteps(ssePhases, now),
    [ssePhases, now]
  );

  /** Task IDs per phase, provided by SSE as each phase starts */
  const phaseTaskIds = useMemo(
    () => PHASES.map((phaseKey) => ssePhases[phaseKey].taskId),
    [ssePhases]
  );

  const handlePhaseChange = useCallback((value: number) => {
    setCurrentPhase(value);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className='pipeline-logs-viewer'>
      {/* Pipeline Phase Navigation */}
      <div className='pipeline-logs-viewer-phases'>
        <Steps
          type='navigation'
          size='small'
          current={currentPhase}
          onChange={handlePhaseChange}
          items={phaseSteps.map((step) => ({
            title: step.title,
            subTitle: step.subTitle,
            status: step.status,
          }))}
        />
      </div>

      {/* Phase Content — all panels stay mounted, only current one is visible */}
      {PHASES.map((phaseKey, index) => (
        <div
          key={phaseKey}
          className='pipeline-logs-viewer-content'
          style={{ display: index === currentPhase ? 'block' : 'none' }}
        >
          {phaseKey === 'fault_injection' ? (
            <FaultInjectionPanel taskId={phaseTaskIds[index]} />
          ) : (
            <LogViewer taskId={phaseTaskIds[index]} loading={loading} />
          )}
        </div>
      ))}
    </div>
  );
};

export default PipelineLogsViewer;
