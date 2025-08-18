import { PlannedStep } from '../template-engine.js';
export declare const workloadBlocks: {
    pod_logs_previous: (sessionId: string, ns: string, pod: string, container?: string) => PlannedStep[];
    pod_probe_config: (sessionId: string, ns: string, pod: string) => PlannedStep[];
};
