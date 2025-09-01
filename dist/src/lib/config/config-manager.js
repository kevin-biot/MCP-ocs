/**
 * Configuration Manager
 *
 * Handles loading and managing configuration for MCP-ocs
 * Supports environment variables, config files, and defaults
 */
import fs from 'fs/promises';
import path from 'path';
export class ConfigManager {
    config = {};
    defaults = {
        memory: {
            namespace: 'mcp-ocs',
            chromaHost: '127.0.0.1',
            chromaPort: 8000,
            jsonDir: './logs/memory',
            compression: true
        },
        openshift: {
            ocPath: 'oc',
            timeout: 30000
        },
        tools: {
            mode: 'single',
            enabledDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
            contextFiltering: true
        },
        workflow: {
            panicDetection: true,
            enforcement: 'guidance',
            minEvidence: 2
        },
        environment: 'dev',
        logLevel: 'info'
    };
    async load() {
        // Start with defaults
        this.config = { ...this.defaults };
        // Try to load from config file
        await this.loadFromFile();
        // Override with environment variables
        this.loadFromEnvironment();
        console.error('⚙️ Configuration loaded successfully');
    }
    get(path, defaultValue) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        for (const key of keys.slice(0, -1)) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        const lastKey = keys[keys.length - 1];
        if (typeof lastKey === 'undefined') {
            throw new Error('Invalid configuration path');
        }
        current[lastKey] = value;
    }
    getAll() {
        return { ...this.config };
    }
    async loadFromFile() {
        const configPaths = [
            './config/mcp-ocs.json',
            './mcp-ocs.config.json',
            path.join(process.env.HOME || '~', '.mcp-ocs.json')
        ];
        for (const configPath of configPaths) {
            try {
                const content = await fs.readFile(configPath, 'utf8');
                const fileConfig = JSON.parse(content);
                this.mergeConfig(fileConfig);
                console.error(`📝 Loaded configuration from ${configPath}`);
                return;
            }
            catch (error) {
                // File doesn't exist or invalid JSON, continue to next
            }
        }
    }
    loadFromEnvironment() {
        const envMappings = {
            // Memory settings
            'MCP_MEMORY_NAMESPACE': 'memory.namespace',
            'MCP_CHROMA_HOST': 'memory.chromaHost',
            'MCP_CHROMA_PORT': 'memory.chromaPort',
            'MCP_MEMORY_DIR': 'memory.jsonDir',
            // OpenShift settings
            'MCP_OC_PATH': 'openshift.ocPath',
            'KUBECONFIG': 'openshift.kubeconfig',
            'MCP_OC_CONTEXT': 'openshift.context',
            'MCP_OC_NAMESPACE': 'openshift.defaultNamespace',
            'MCP_OC_TIMEOUT': 'openshift.timeout',
            // Tool settings
            'MCP_TOOL_MODE': 'tools.mode',
            'MCP_TOOL_DOMAINS': 'tools.enabledDomains',
            'MCP_CONTEXT_FILTERING': 'tools.contextFiltering',
            // Workflow settings
            'MCP_PANIC_DETECTION': 'workflow.panicDetection',
            'MCP_ENFORCEMENT': 'workflow.enforcement',
            'MCP_MIN_EVIDENCE': 'workflow.minEvidence',
            // General settings
            'NODE_ENV': 'environment',
            'MCP_LOG_LEVEL': 'logLevel'
        };
        for (const [envVar, configPath] of Object.entries(envMappings)) {
            const value = process.env[envVar];
            if (value !== undefined) {
                // Parse boolean and numeric values
                let parsedValue = value;
                if (value === 'true')
                    parsedValue = true;
                else if (value === 'false')
                    parsedValue = false;
                else if (/^\d+$/.test(value))
                    parsedValue = parseInt(value);
                else if (value.includes(','))
                    parsedValue = value.split(',').map(s => s.trim());
                this.set(configPath, parsedValue);
            }
        }
    }
    mergeConfig(newConfig) {
        this.config = this.deepMerge(this.config, newConfig);
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
}
