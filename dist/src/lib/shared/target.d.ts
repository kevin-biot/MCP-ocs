export type TargetSelector = "all" | "system" | "user" | {
    names?: string[];
    labelSelector?: string;
    regex?: string;
    sample?: {
        size: number;
        seed?: number | string;
    };
};
export interface Target {
    scope: "cluster" | "namespaces";
    selector: TargetSelector;
}
export declare function isTarget(value: any): value is Target;
