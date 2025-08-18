export declare const BlockRegistry: {
    infra: {
        nodes_analysis: (sessionId: string) => import("../template-engine.js").PlannedStep[];
        events_scheduling: (sessionId: string, ns: string, pod: string) => import("../template-engine.js").PlannedStep[];
        pod_constraints: (sessionId: string, ns: string, controller: string) => import("../template-engine.js").PlannedStep[];
        endpoints_describe: (sessionId: string, ns: string, svc: string) => import("../template-engine.js").PlannedStep[];
        route_describe: (sessionId: string, ns: string, route: string) => import("../template-engine.js").PlannedStep[];
        pvc_describe: (sessionId: string, ns: string, pvc: string) => import("../template-engine.js").PlannedStep[];
        storageclass_describe: (sessionId: string, sc: string) => import("../template-engine.js").PlannedStep[];
        resourcequota_describe: (sessionId: string, ns: string) => import("../template-engine.js").PlannedStep[];
    };
    workload: {
        pod_logs_previous: (sessionId: string, ns: string, pod: string, container?: string) => import("../template-engine.js").PlannedStep[];
        pod_probe_config: (sessionId: string, ns: string, pod: string) => import("../template-engine.js").PlannedStep[];
    };
};
