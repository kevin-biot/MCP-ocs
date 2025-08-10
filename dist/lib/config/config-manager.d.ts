/**
 * Configuration Manager
 *
 * Handles loading and managing configuration for MCP-ocs
 * Supports environment variables, config files, and defaults
 */
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
        mode: 'single' | 'team' | 'router';
        enabledDomains: string[];
        contextFiltering: boolean;
    };
    workflow: {
        panicDetection: boolean;
        enforcement: 'guidance' | 'blocking';
        minEvidence: number;
    };
    environment: 'dev' | 'test' | 'staging' | 'prod';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export declare class ConfigManager {
    private config;
    private defaults;
    load(): Promise<void>;
    get<T>(path: string, defaultValue?: T): T;
    set(path: string, value: any): void;
    getAll(): Partial<ConfigSchema>;
    private loadFromFile;
    private loadFromEnvironment;
    private mergeConfig;
    private deepMerge;
}
