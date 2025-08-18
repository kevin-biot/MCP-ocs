import { PlannedStep } from '../templates/template-engine.js';
export interface EnforcerConfig {
    maxSteps: number;
    timeoutMs: number;
    allowedNamespaces?: string[];
    toolWhitelist?: string[];
    circuit?: {
        windowMs: number;
        maxRepeatCallsPerTool: number;
    };
}
export declare class BoundaryEnforcer {
    private cfg;
    private recent;
    constructor(cfg: EnforcerConfig);
    filterSteps(steps: PlannedStep[]): PlannedStep[];
}
