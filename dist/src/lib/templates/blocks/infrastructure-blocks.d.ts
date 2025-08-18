import { PlannedStep } from '../template-engine.js';
export declare const infraBlocks: {
    nodes_analysis: (sessionId: string) => PlannedStep[];
    events_scheduling: (sessionId: string, ns: string, pod: string) => PlannedStep[];
    pod_constraints: (sessionId: string, ns: string, controller: string) => PlannedStep[];
    endpoints_describe: (sessionId: string, ns: string, svc: string) => PlannedStep[];
    route_describe: (sessionId: string, ns: string, route: string) => PlannedStep[];
    pvc_describe: (sessionId: string, ns: string, pvc: string) => PlannedStep[];
    storageclass_describe: (sessionId: string, sc: string) => PlannedStep[];
    resourcequota_describe: (sessionId: string, ns: string) => PlannedStep[];
};
