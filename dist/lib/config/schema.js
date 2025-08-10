/**
 * Configuration Schema and Validation - Addressing Qwen Review
 *
 * Centralizes configuration defaults and provides validation
 */
import fs from 'fs/promises';
import { execSync } from 'child_process';
// Centralized configuration schema with validation rules
export const CONFIG_SCHEMA = {
    memory: {
        namespace: {
            default: 'mcp-ocs',
            required: true,
            validator: (v) => /^[a-z0-9\-]+$/.test(v),
            description: 'Memory namespace must be lowercase alphanumeric with hyphens'
        },
        chromaHost: {
            default: '127.0.0.1',
            validator: (v) => /^[\w\.\-]+$/.test(v),
            description: 'ChromaDB host must be valid hostname or IP'
        },
        chromaPort: {
            default: 8000,
            validator: (v) => v > 0 && v < 65536,
            description: 'ChromaDB port must be valid port number'
        },
        jsonDir: {
            default: './logs/memory',
            validator: (v) => !v.includes('..') && !v.startsWith('/'),
            description: 'JSON directory must be relative path without parent directory references'
        },
        compression: {
            default: true
        }
    },
    openshift: {
        ocPath: {
            default: 'oc',
            required: true,
            description: 'Path to OpenShift CLI executable'
        },
        timeout: {
            default: 30000,
            validator: (v) => v > 1000 && v < 300000,
            description: 'Timeout must be between 1-300 seconds'
        }
    },
    tools: {
        mode: {
            default: 'single',
            validator: (v) => ['single', 'team', 'router'].includes(v),
            description: 'Tool mode must be single, team, or router'
        },
        enabledDomains: {
            default: ['cluster', 'filesystem', 'knowledge', 'system']
        },
        contextFiltering: {
            default: true
        }
    },
    workflow: {
        panicDetection: {
            default: true
        },
        enforcement: {
            default: 'guidance',
            validator: (v) => ['guidance', 'blocking'].includes(v),
            description: 'Enforcement level must be guidance or blocking'
        },
        minEvidence: {
            default: 2,
            validator: (v) => v >= 1 && v <= 10,
            description: 'Minimum evidence must be between 1-10'
        }
    },
    environment: {
        default: 'dev',
        validator: (v) => ['dev', 'test', 'staging', 'prod'].includes(v),
        description: 'Environment must be dev, test, staging, or prod'
    },
    logLevel: {
        default: 'info',
        validator: (v) => ['debug', 'info', 'warn', 'error'].includes(v),
        description: 'Log level must be debug, info, warn, or error'
    }
};
/**
 * Configuration validator addressing Qwen review concerns
 */
export class ConfigValidator {
    async validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate OpenShift CLI availability
        await this.validateOpenShiftCli(config.openshift?.ocPath || 'oc', errors);
        // Validate memory directory permissions
        await this.validateMemoryDirectory(config.memory?.jsonDir || './logs/memory', errors);
        // Validate ChromaDB connectivity (non-blocking)
        await this.validateChromaDB(config.memory, warnings);
        // Validate configuration values against schema
        this.validateAgainstSchema(config, errors);
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    async validateOpenShiftCli(ocPath, errors) {
        try {
            execSync(`${ocPath} version --client`, {
                timeout: 5000,
                stdio: 'pipe' // Suppress output
            });
        }
        catch (error) {
            errors.push(`OpenShift CLI not found or not working at: ${ocPath}`);
        }
    }
    async validateMemoryDirectory(jsonDir, errors) {
        try {
            // Create directory if it doesn't exist
            await fs.mkdir(jsonDir, { recursive: true });
            // Test write permissions
            const testFile = `${jsonDir}/.write-test`;
            await fs.writeFile(testFile, 'test');
            await fs.unlink(testFile);
        }
        catch (error) {
            errors.push(`Memory directory not writable: ${jsonDir} - ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async validateChromaDB(memoryConfig, warnings) {
        if (!memoryConfig?.chromaHost || !memoryConfig?.chromaPort)
            return;
        try {
            // Simple connectivity test (would be enhanced with actual ChromaDB client)
            const response = await fetch(`http://${memoryConfig.chromaHost}:${memoryConfig.chromaPort}/api/v1/heartbeat`, {
                signal: AbortSignal.timeout(3000)
            });
            if (!response.ok) {
                warnings.push(`ChromaDB not responding at ${memoryConfig.chromaHost}:${memoryConfig.chromaPort} - will use JSON fallback`);
            }
        }
        catch (error) {
            warnings.push(`ChromaDB not reachable at ${memoryConfig.chromaHost}:${memoryConfig.chromaPort} - will use JSON fallback`);
        }
    }
    validateAgainstSchema(config, errors) {
        // Validate memory configuration
        if (config.memory) {
            this.validateField('memory.namespace', config.memory.namespace, CONFIG_SCHEMA.memory.namespace, errors);
            this.validateField('memory.chromaPort', config.memory.chromaPort, CONFIG_SCHEMA.memory.chromaPort, errors);
            this.validateField('memory.jsonDir', config.memory.jsonDir, CONFIG_SCHEMA.memory.jsonDir, errors);
        }
        // Validate workflow configuration  
        if (config.workflow) {
            this.validateField('workflow.enforcement', config.workflow.enforcement, CONFIG_SCHEMA.workflow.enforcement, errors);
            this.validateField('workflow.minEvidence', config.workflow.minEvidence, CONFIG_SCHEMA.workflow.minEvidence, errors);
        }
        // Validate top-level fields
        this.validateField('environment', config.environment, CONFIG_SCHEMA.environment, errors);
        this.validateField('logLevel', config.logLevel, CONFIG_SCHEMA.logLevel, errors);
    }
    validateField(fieldPath, value, rule, errors) {
        if (value === undefined) {
            if (rule.required) {
                errors.push(`Required field missing: ${fieldPath}`);
            }
            return;
        }
        if (rule.validator && !rule.validator(value)) {
            const description = rule.description || `Invalid value for ${fieldPath}`;
            errors.push(`${description}: ${value}`);
        }
    }
}
/**
 * Type guards for enhanced type safety
 */
export function isValidEnvironment(env) {
    return ['dev', 'test', 'staging', 'prod'].includes(env);
}
export function isValidLogLevel(level) {
    return ['debug', 'info', 'warn', 'error'].includes(level);
}
export function isValidToolMode(mode) {
    return ['single', 'team', 'router'].includes(mode);
}
export function isValidEnforcementLevel(level) {
    return ['guidance', 'blocking'].includes(level);
}
/**
 * Resource URI constants for consistency
 */
export const RESOURCE_PATTERNS = {
    CLUSTER: 'cluster://',
    MEMORY: 'memory://',
    WORKFLOW: 'workflow://',
    SYSTEM: 'system://'
};
