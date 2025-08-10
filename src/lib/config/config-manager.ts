/**
 * Configuration Manager
 * 
 * Handles loading and managing configuration for MCP-ocs
 * Supports environment variables, config files, and defaults
 */

import fs from 'fs/promises';
import path from 'path';

export interface ConfigSchema {
  // Memory configuration
  memory: {
    namespace: string;
    chromaHost: string;
    chromaPort: number;
    jsonDir: string;
    compression: boolean;
  };
  
  // OpenShift configuration
  openshift: {
    ocPath: string;
    kubeconfig?: string;
    context?: string;
    defaultNamespace?: string;
    timeout: number;
  };
  
  // Tool configuration
  tools: {
    mode: 'single' | 'team' | 'router';
    enabledDomains: string[];
    contextFiltering: boolean;
  };
  
  // Workflow configuration
  workflow: {
    panicDetection: boolean;
    enforcement: 'guidance' | 'blocking';
    minEvidence: number;
  };
  
  // General configuration
  environment: 'dev' | 'test' | 'staging' | 'prod';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class ConfigManager {
  private config: Partial<ConfigSchema> = {};
  private defaults: ConfigSchema = {
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

  async load(): Promise<void> {
    // Start with defaults
    this.config = { ...this.defaults };
    
    // Try to load from config file
    await this.loadFromFile();
    
    // Override with environment variables
    this.loadFromEnvironment();
    
    console.error('⚙️ Configuration loaded successfully');
  }

  get<T>(path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue as T;
      }
    }
    
    return value as T;
  }

  set(path: string, value: any): void {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  getAll(): Partial<ConfigSchema> {
    return { ...this.config };
  }

  private async loadFromFile(): Promise<void> {
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
      } catch (error) {
        // File doesn't exist or invalid JSON, continue to next
      }
    }
  }

  private loadFromEnvironment(): void {
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
        let parsedValue: any = value;
        
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (/^\d+$/.test(value)) parsedValue = parseInt(value);
        else if (value.includes(',')) parsedValue = value.split(',').map(s => s.trim());
        
        this.set(configPath, parsedValue);
      }
    }
  }

  private mergeConfig(newConfig: any): void {
    this.config = this.deepMerge(this.config, newConfig);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}
