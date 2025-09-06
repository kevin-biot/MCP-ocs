export interface PodHealthSummary {
    ready: number;
    total: number;
    crashloops: string[];
    pending: string[];
    imagePullErrors: string[];
    oomKilled: string[];
}
export interface PVCHealthSummary {
    bound: number;
    pending: number;
    failed: number;
    total: number;
    errors: string[];
}
export interface RouteHealthSummary {
    total: number;
    reachable?: boolean;
    probe?: {
        url: string;
        code: number;
        message: string;
    };
}
