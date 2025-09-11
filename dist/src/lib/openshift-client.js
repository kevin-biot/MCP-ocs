/**
 * OpenShift Client - ADR-001 Implementation
 *
 * Phase 1: CLI wrapper approach for rapid development
 * Uses `oc` command execution with proper error handling and output parsing
 */
import { execSync, spawn } from 'child_process';
import { TimeoutError } from './errors/index.js';
export class OpenShiftClient {
    config;
    envVars;
    constructor(config) {
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
    async validateConnection() {
        try {
            await this.executeOcCommand(['cluster-info'], { timeout: 10000 });
            console.error('✅ OpenShift connection validated');
        }
        catch (error) {
            throw new Error(`Failed to connect to OpenShift cluster: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get cluster information and status
     */
    async getClusterInfo() {
        try {
            const settled = await Promise.allSettled([
                this.executeOcCommand(['version', '-o', 'json']),
                this.executeOcCommand(['whoami']),
                this.executeOcCommand(['project', '-q'])
            ]);
            const versionOutput = settled[0].status === 'fulfilled' ? settled[0].value : '{}';
            const whoamiOutput = settled[1].status === 'fulfilled' ? settled[1].value : 'unknown';
            const projectOutput = settled[2].status === 'fulfilled' ? settled[2].value : 'default';
            const versionData = JSON.parse(versionOutput);
            const currentUser = whoamiOutput.trim();
            const currentProject = projectOutput.trim();
            // Get server URL (do not fail the whole call if this errors)
            let serverUrl = 'unknown';
            try {
                const configOutput = await this.executeOcCommand(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}']);
                serverUrl = configOutput.trim() || 'unknown';
            }
            catch { }
            return {
                version: versionData.clientVersion?.gitVersion || 'unknown',
                serverUrl,
                currentUser,
                currentProject,
                status: 'connected'
            };
        }
        catch (error) {
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
    async getPods(namespace, selector) {
        const args = ['get', 'pods'];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        if (selector) {
            args.push('-l', selector);
        }
        args.push('-o', 'json');
        const output = await this.executeOcCommand(args);
        const data = JSON.parse(output);
        return (data.items || []).map((pod) => this.parsePodInfo(pod));
    }
    /**
     * Describe a specific resource
     */
    async describeResource(resourceType, name, namespace) {
        const args = ['describe', resourceType, name];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        return await this.executeOcCommand(args);
    }
    /**
     * List resources of a given type and return names (+namespaces when present)
     * Supports namespace === 'all' (-A) for multi-namespace expansion.
     */
    async listResources(resourceType, namespace) {
        const args = ['get', resourceType];
        if (namespace === 'all') {
            args.push('-A');
        }
        else if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        args.push('-o', 'json');
        const output = await this.executeOcCommand(args);
        let data = {};
        try {
            data = JSON.parse(output);
        }
        catch { }
        const items = Array.isArray(data?.items) ? data.items : [];
        return items.map((it) => ({ name: it?.metadata?.name, namespace: it?.metadata?.namespace })).filter(r => typeof r.name === 'string');
    }
    /**
     * Get logs from a pod
     */
    async getLogs(podName, namespace, options = {}) {
        const args = ['logs', podName];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
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
    async getEvents(namespace, fieldSelector) {
        const args = ['get', 'events'];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        if (fieldSelector) {
            args.push('--field-selector', fieldSelector);
        }
        args.push('-o', 'json');
        const output = await this.executeOcCommand(args);
        const data = JSON.parse(output);
        return (data.items || []).map((event) => this.parseEventInfo(event));
    }
    /**
     * Apply configuration from YAML/JSON
     */
    async applyConfig(config, namespace) {
        const args = ['apply', '-f', '-'];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        return await this.executeOcCommandWithInput(args, config);
    }
    /**
     * Scale a deployment
     */
    async scaleDeployment(name, replicas, namespace) {
        const args = ['scale', 'deployment', name, '--replicas', replicas.toString()];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.config.namespace) {
            args.push('-n', this.config.namespace);
        }
        return await this.executeOcCommand(args);
    }
    /**
     * Execute raw oc command
     */
    async executeRawCommand(args) {
        return await this.executeOcCommand(args);
    }
    /**
     * Clean up resources
     */
    async close() {
        // No persistent connections to close in CLI wrapper mode
    }
    /**
     * Private helper methods
     */
    async executeOcCommand(args, options = {}) {
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
                maxBuffer: 64 * 1024 * 1024 // 64MB buffer for large outputs
            });
            return output.toString();
        }
        catch (error) {
            const errorMessage = error?.stderr ? error.stderr.toString() : error?.message;
            const details = {
                args,
                code: typeof error?.status === 'number' ? error.status : undefined,
                stderr: error?.stderr ? String(error.stderr) : undefined,
            };
            const { ExternalCommandError } = await import('./errors/index.js');
            throw new ExternalCommandError(`OpenShift command failed: ${errorMessage}`, { cause: error, details });
        }
    }
    async executeOcCommandWithInput(args, input) {
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
                }
                else {
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
                reject(new TimeoutError('Command timed out'));
            }, this.config.timeout);
        });
    }
    sanitizeArgument(arg) {
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
    parsePodInfo(pod) {
        const status = pod.status?.phase || 'Unknown';
        const conditions = pod.status?.conditions || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        const ready = readyCondition ? (readyCondition.status === 'True' ? '1/1' : '0/1') : '0/1';
        let restarts = 0;
        if (pod.status?.containerStatuses) {
            restarts = pod.status.containerStatuses.reduce((sum, cs) => sum + (cs.restartCount || 0), 0);
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
    parseEventInfo(event) {
        return {
            type: event.type || 'Normal',
            reason: event.reason || 'Unknown',
            object: `${event.involvedObject?.kind || 'Unknown'}/${event.involvedObject?.name || 'Unknown'}`,
            message: event.message || '',
            timestamp: event.firstTimestamp || event.eventTime || new Date().toISOString(),
            source: event.source?.component || event.reportingComponent || 'Unknown'
        };
    }
    calculateAge(creationTimestamp) {
        if (!creationTimestamp)
            return 'unknown';
        const created = new Date(creationTimestamp);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0)
            return `${days}d`;
        if (hours > 0)
            return `${hours}h`;
        return `${minutes}m`;
    }
}
