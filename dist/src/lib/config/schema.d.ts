/**
 * Configuration Schema and Validation - Addressing Qwen Review
 *
 * Centralizes configuration defaults and provides validation
 */
export type Environment = 'dev' | 'test' | 'staging' | 'prod';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type ToolMode = 'single' | 'team' | 'router';
export type EnforcementLevel = 'guidance' | 'blocking';
export interface ConfigSchema {
    memory: {
        namespace: string;
        chromaHost: string;
        chromaPort: number;
        jsonDir: string;
        compression: boolean;
    };
    openshift: {
        ocPath: string;
        kubeconfig?: string;
        context?: string;
        defaultNamespace?: string;
        timeout: number;
    };
    tools: {
        mode: ToolMode;
        enabledDomains: string[];
        contextFiltering: boolean;
    };
    workflow: {
        panicDetection: boolean;
        enforcement: EnforcementLevel;
        minEvidence: number;
    };
    environment: Environment;
    logLevel: LogLevel;
}
export declare const CONFIG_SCHEMA: {
    readonly memory: {
        readonly namespace: {
            readonly default: "mcp-ocs";
            readonly required: true;
            readonly validator: (v: string) => boolean;
            readonly description: "Memory namespace must be lowercase alphanumeric with hyphens";
        };
        readonly chromaHost: {
            readonly default: "127.0.0.1";
            readonly validator: (v: string) => boolean;
            readonly description: "ChromaDB host must be valid hostname or IP";
        };
        readonly chromaPort: {
            readonly default: 8000;
            readonly validator: (v: number) => boolean;
            readonly description: "ChromaDB port must be valid port number";
        };
        readonly jsonDir: {
            readonly default: "./logs/memory";
            readonly validator: (v: string) => boolean;
            readonly description: "JSON directory must be relative path without parent directory references";
        };
        readonly compression: {
            readonly default: true;
        };
    };
    readonly openshift: {
        readonly ocPath: {
            readonly default: "oc";
            readonly required: true;
            readonly description: "Path to OpenShift CLI executable";
        };
        readonly timeout: {
            readonly default: 30000;
            readonly validator: (v: number) => boolean;
            readonly description: "Timeout must be between 1-300 seconds";
        };
    };
    readonly tools: {
        readonly mode: {
            readonly default: ToolMode;
            readonly validator: (v: string) => boolean;
            readonly description: "Tool mode must be single, team, or router";
        };
        readonly enabledDomains: {
            readonly default: readonly ["cluster", "filesystem", "knowledge", "system"];
        };
        readonly contextFiltering: {
            readonly default: true;
        };
    };
    readonly workflow: {
        readonly panicDetection: {
            readonly default: true;
        };
        readonly enforcement: {
            readonly default: EnforcementLevel;
            readonly validator: (v: string) => boolean;
            readonly description: "Enforcement level must be guidance or blocking";
        };
        readonly minEvidence: {
            readonly default: 2;
            readonly validator: (v: number) => boolean;
            readonly description: "Minimum evidence must be between 1-10";
        };
    };
    readonly environment: {
        readonly default: Environment;
        readonly validator: (v: string) => boolean;
        readonly description: "Environment must be dev, test, staging, or prod";
    };
    readonly logLevel: {
        readonly default: LogLevel;
        readonly validator: (v: string) => boolean;
        readonly description: "Log level must be debug, info, warn, or error";
    };
};
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Configuration validator addressing Qwen review concerns
 */
export declare class ConfigValidator {
    validateConfiguration(config: Partial<ConfigSchema>): Promise<ValidationResult>;
    private validateOpenShiftCli;
    private validateMemoryDirectory;
    private validateChromaDB;
    private validateAgainstSchema;
    private validateField;
}
/**
 * Type guards for enhanced type safety
 */
export declare function isValidEnvironment(env: string): env is Environment;
export declare function isValidLogLevel(level: string): level is LogLevel;
export declare function isValidToolMode(mode: string): mode is ToolMode;
export declare function isValidEnforcementLevel(level: string): level is EnforcementLevel;
/**
 * Resource URI constants for consistency
 */
export declare const RESOURCE_PATTERNS: {
    readonly CLUSTER: "cluster://";
    readonly MEMORY: "memory://";
    readonly WORKFLOW: "workflow://";
    readonly SYSTEM: "system://";
};
export type ResourcePattern = typeof RESOURCE_PATTERNS[keyof typeof RESOURCE_PATTERNS];
