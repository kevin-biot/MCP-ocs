export declare const student03PendingPVCScenario: {
    namespace: string;
    pvcName: string;
    storageClassName: string;
    volumeBindingMode: string;
    pvc: {
        apiVersion: string;
        kind: string;
        metadata: {
            name: string;
            namespace: string;
        };
        spec: {
            accessModes: string[];
            resources: {
                requests: {
                    storage: string;
                };
            };
            storageClassName: string;
        };
        status: {
            phase: string;
        };
    };
    events: {
        type: string;
        reason: string;
        message: string;
        involvedObject: {
            kind: string;
            name: string;
        };
    }[];
    expectedResolution: {
        action: string;
        command: string;
    };
};
export declare const multiNamespacePVCs: {
    namespaces: {
        name: string;
        pvcs: {
            name: string;
            status: string;
            storage: string;
            class: string;
        }[];
    }[];
    storageClasses: {
        name: string;
        provisioner: string;
        costTier: string;
    }[];
};
export declare const costAssumptions: {
    costPerGB: number;
    premiumMultiplier: number;
};
export declare const eventDataForPendingPVCs: {
    type: string;
    reason: string;
    message: string;
}[];
