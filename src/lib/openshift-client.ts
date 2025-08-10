/**
 * OpenShift Client - ADR-001 Implementation
 * 
 * Phase 1: CLI wrapper approach for rapid development
 * Uses `oc` command execution with proper error handling and output parsing
 */

import { execSync, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';

export interface OpenShiftConfig {
  ocPath: string;
  kubeconfig?: string;
  context?: string;
  namespace?: string;
  timeout: number;
}

export interface ClusterInfo {
  version: string;
  serverUrl: string;
  currentUser: string;
  currentProject: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  ip?: string;
  node?: string;
}

export interface EventInfo {
  type: string;
  reason: string;
  object: string;
  message: string;
  timestamp: string;
  source: string;
}

export class OpenShiftClient {
  private config: OpenShiftConfig;
  private envVars: Record<string, string>;

  constructor(config: OpenShiftConfig) {
    this.config = config;
    this.envVars = {};
    
    // Set up kubeconfig environment variable if provided
    if (config.kubeconfig) {
      this.envVars.KUBECONFIG = config.kubeconfig;
    }
  }

  /**
   * Validate connection to OpenShift cluster
   */
  async validateConnection(): Promise<void> {
    try {
      await this.executeOcCommand(['cluster-info'], { timeout: 10000 });
      console.error('✅ OpenShift connection validated');
    } catch (error) {
      throw new Error(`Failed to connect to OpenShift cluster: ${error.message}`);
    }
  }

  /**
   * Get cluster information and status
   */
  async getClusterInfo(): Promise<ClusterInfo> {
    try {
      const [versionOutput, whoamiOutput, projectOutput] = await Promise.all([
        this.executeOcCommand(['version', '--client', '-o', 'json']),
        this.executeOcCommand(['whoami']),
        this.executeOcCommand(['project', '-q']).catch(() => 'default')
      ]);

      const versionData = JSON.parse(versionOutput);
      const currentUser = whoamiOutput.trim();
      const currentProject = projectOutput.trim();

      // Get server URL
      const configOutput = await this.executeOcCommand(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}']);
      const serverUrl = configOutput.trim();

      return {
        version: versionData.clientVersion?.gitVersion || 'unknown',
        serverUrl,
        currentUser,
        currentProject,
        status: 'connected'
      };
    } catch (error) {
      return {
        version: 'unknown',
        serverUrl: 'unknown',
        currentUser: 'unknown', 
        currentProject: 'unknown',
        status: 'error'
      };
    }
  }

  /**
   * Get pods in a namespace
   */
  async getPods(namespace?: string, selector?: string): Promise<PodInfo[]> {
    const args = ['get', 'pods'];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    if (selector) {
      args.push('-l', selector);
    }
    
    args.push('-o', 'json');
    
    const output = await this.executeOcCommand(args);
    const data = JSON.parse(output);
    
    return (data.items || []).map((pod: any) => this.parsePodInfo(pod));
  }

  /**
   * Describe a specific resource
   */
  async describeResource(resourceType: string, name: string, namespace?: string): Promise<string> {
    const args = ['describe', resourceType, name];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    return await this.executeOcCommand(args);
  }

  /**
   * Get logs from a pod
   */
  async getLogs(podName: string, namespace?: string, options: {
    container?: string;
    lines?: number;
    follow?: boolean;
    since?: string;
  } = {}): Promise<string> {
    const args = ['logs', podName];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    if (options.container) {
      args.push('-c', options.container);
    }
    
    if (options.lines) {
      args.push('--tail', options.lines.toString());
    }
    
    if (options.since) {
      args.push('--since', options.since);
    }
    
    return await this.executeOcCommand(args);
  }

  /**
   * Get events in a namespace
   */
  async getEvents(namespace?: string, fieldSelector?: string): Promise<EventInfo[]> {
    const args = ['get', 'events'];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    if (fieldSelector) {
      args.push('--field-selector', fieldSelector);
    }
    
    args.push('-o', 'json');
    
    const output = await this.executeOcCommand(args);
    const data = JSON.parse(output);
    
    return (data.items || []).map((event: any) => this.parseEventInfo(event));
  }

  /**
   * Apply configuration from YAML/JSON
   */
  async applyConfig(config: string, namespace?: string): Promise<string> {
    const args = ['apply', '-f', '-'];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    return await this.executeOcCommandWithInput(args, config);
  }

  /**
   * Scale a deployment
   */
  async scaleDeployment(name: string, replicas: number, namespace?: string): Promise<string> {
    const args = ['scale', 'deployment', name, '--replicas', replicas.toString()];
    
    if (namespace) {
      args.push('-n', namespace);
    } else if (this.config.namespace) {
      args.push('-n', this.config.namespace);
    }
    
    return await this.executeOcCommand(args);
  }

  /**
   * Execute raw oc command
   */
  async executeRawCommand(args: string[]): Promise<string> {
    return await this.executeOcCommand(args);
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    // No persistent connections to close in CLI wrapper mode
  }

  /**
   * Private helper methods
   */

  private async executeOcCommand(args: string[], options: { timeout?: number } = {}): Promise<string> {
    const timeout = options.timeout || this.config.timeout;
    
    try {
      // Sanitize arguments to prevent command injection
      const sanitizedArgs = args.map(arg => this.sanitizeArgument(arg));
      
      const command = `${this.config.ocPath} ${sanitizedArgs.join(' ')}`;
      
      console.error(`🔧 Executing: ${command}`);
      
      const output = execSync(command, {
        encoding: 'utf8',
        timeout,
        env: { ...process.env, ...this.envVars },
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      return output.toString();
    } catch (error: any) {
      const errorMessage = error.stderr ? error.stderr.toString() : error.message;
      throw new Error(`OpenShift command failed: ${errorMessage}`);
    }
  }

  private async executeOcCommandWithInput(args: string[], input: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const sanitizedArgs = args.map(arg => this.sanitizeArgument(arg));
      
      const child = spawn(this.config.ocPath, sanitizedArgs, {
        env: { ...process.env, ...this.envVars },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Send input and close stdin
      child.stdin.write(input);
      child.stdin.end();

      // Set timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Command timed out'));
      }, this.config.timeout);
    });
  }

  private sanitizeArgument(arg: string): string {
    // Basic sanitization to prevent command injection
    // Allow alphanumeric, hyphens, dots, colons, slashes, equals, commas
    const sanitized = arg.replace(/[^a-zA-Z0-9\-\.\:\/\=\,\_\@\[\]]/g, '');
    
    // If sanitization changed the argument, it might be malicious
    if (sanitized !== arg && arg.includes(' ')) {
      // Quote arguments that contain spaces after sanitization
      return `"${sanitized}"`;
    }
    
    return sanitized;
  }

  private parsePodInfo(pod: any): PodInfo {
    const status = pod.status?.phase || 'Unknown';
    const conditions = pod.status?.conditions || [];
    const readyCondition = conditions.find((c: any) => c.type === 'Ready');
    const ready = readyCondition ? (readyCondition.status === 'True' ? '1/1' : '0/1') : '0/1';
    
    let restarts = 0;
    if (pod.status?.containerStatuses) {
      restarts = pod.status.containerStatuses.reduce((sum: number, cs: any) => sum + (cs.restartCount || 0), 0);
    }

    return {
      name: pod.metadata?.name || 'unknown',
      namespace: pod.metadata?.namespace || 'unknown',
      status,
      ready,
      restarts,
      age: this.calculateAge(pod.metadata?.creationTimestamp),
      ip: pod.status?.podIP,
      node: pod.spec?.nodeName
    };
  }

  private parseEventInfo(event: any): EventInfo {
    return {
      type: event.type || 'Normal',
      reason: event.reason || 'Unknown',
      object: `${event.involvedObject?.kind || 'Unknown'}/${event.involvedObject?.name || 'Unknown'}`,
      message: event.message || '',
      timestamp: event.firstTimestamp || event.eventTime || new Date().toISOString(),
      source: event.source?.component || event.reportingComponent || 'Unknown'
    };
  }

  private calculateAge(creationTimestamp?: string): string {
    if (!creationTimestamp) return 'unknown';
    
    const created = new Date(creationTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }
}
