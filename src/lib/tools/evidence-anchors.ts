import { promises as fs } from 'fs';

export interface AnchorOptions {
  startIso: string;
  endIso: string;
  toolId: string;
}

// Minimal, bounded anchors per design: logs pointer and stable artifacts when present
export async function collectAnchors(opts: AnchorOptions): Promise<string[]> {
  const anchors: string[] = [];
  try {
    // logs/sprint-execution.log pointer
    try {
      await fs.access('logs/sprint-execution.log');
      anchors.push(`logs/sprint-execution.log#start=${encodeURIComponent(opts.startIso)}&end=${encodeURIComponent(opts.endIso)}`);
    } catch {}
    // Technical design reference anchor
    try {
      await fs.access('sprint-management/features/epics/f-011-vector-collections-v2/technical-design.md');
      anchors.push('epic:f-011:technical-design');
    } catch {}
    // Metrics artifact self reference ensures traceability
    anchors.push('artifact:08-technical-metrics-data.json');
  } catch {}
  return anchors;
}

