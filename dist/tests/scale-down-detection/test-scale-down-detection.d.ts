#!/usr/bin/env node
declare function analyzeScaleDownPatterns(deploymentsData: any, eventsData: any, podHealth: any): {
    isScaleDown: boolean;
    evidence: never[];
    deploymentStatus: {
        total: any;
        scaledToZero: number;
        recentlyScaled: never[];
    };
    scaleDownEvents: never[];
    verdict: string;
};
declare namespace mockDeploymentsData {
    let items: {
        metadata: {
            name: string;
            resourceVersion: string;
        };
        spec: {
            replicas: number;
        };
        status: {
            availableReplicas: number;
            readyReplicas: number;
        };
    }[];
}
declare namespace mockEventsData {
    let items_1: {
        reason: string;
        message: string;
        lastTimestamp: string;
        involvedObject: {
            kind: string;
            name: string;
        };
    }[];
    export { items_1 as items };
}
declare namespace mockPodHealth {
    let ready: number;
    let total: number;
    let crashloops: never[];
    let pending: never[];
    let imagePullErrors: never[];
    let oomKilled: never[];
}
declare namespace result {
    let isScaleDown: boolean;
    let evidence: never[];
    namespace deploymentStatus {
        let total_1: any;
        export { total_1 as total };
        export let scaledToZero: number;
        export let recentlyScaled: never[];
    }
    let scaleDownEvents: never[];
    let verdict: string;
}
declare namespace expectedOutcomes {
    let isScaleDown_1: boolean;
    export { isScaleDown_1 as isScaleDown };
    let verdict_1: string;
    export { verdict_1 as verdict };
    let scaledToZero_1: number;
    export { scaledToZero_1 as scaledToZero };
    export let hasEvidence: boolean;
}
declare const tests: ({
    name: string;
    expected: boolean;
    actual: boolean;
    pass: boolean;
} | {
    name: string;
    expected: string;
    actual: string;
    pass: boolean;
} | {
    name: string;
    expected: number;
    actual: number;
    pass: boolean;
})[];
declare let passedTests: number;
