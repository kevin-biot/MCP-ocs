/**
 * Enhanced OpenShift Client - Addressing Technical Review
 *
 * Production-hardened implementation with security, resilience, and performance improvements
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { logger } from './logging/structured-logger';
import { nowEpoch } from '../utils/time.js';
const execAsync = promisify(exec);
/**
 * Circuit breaker for resilient OpenShift operations
 */
class CircuitBreaker {
    name;
    errorThreshold;
    resetTimeout;
    failures = 0;
    lastFailureTime = 0;
    state = 'closed';
    constructor(name, errorThreshold = 5, resetTimeout = 30000) {
        this.name = name;
        this.errorThreshold = errorThreshold;
        this.resetTimeout = resetTimeout;
    }
    async execute(operation) {
        if (this.state === 'open') {
            if (nowEpoch() - this.lastFailureTime < this.resetTimeout) {
                throw new Error(`Circuit breaker ${this.name} is open`);
            }
            this.state = 'half-open';
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failures = 0;
        this.state = 'closed';
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = nowEpoch();
        if (this.failures >= this.errorThreshold) {
            this.state = 'open';
            logger.warn('Circuit breaker opened', {
                name: this.name,
                failures: this.failures,
                threshold: this.errorThreshold
            });
        }
    }
}
/**
 * Enhanced OpenShift Client with production hardening
 */
export class OpenShiftClient {
    ocPath;
    kubeconfig;
    context;
    defaultNamespace;
    timeout;
    circuitBreaker;
    requestQueue = new Map();
    clusterInfoCache = null;
    CACHE_TTL = 30000; // 30 seconds
    constructor(config) {
        // Validate configuration before initialization
        this.validateConfigurationSync(config);
        this.ocPath = config.ocPath || 'oc';
        if (typeof config.kubeconfig === 'string')
            this.kubeconfig = config.kubeconfig;
        if (typeof config.context === 'string')
            this.context = config.context;
        if (typeof config.defaultNamespace === 'string')
            this.defaultNamespace = config.defaultNamespace;
        this.timeout = config.timeout || 30000;
        this.circuitBreaker = new CircuitBreaker('openshift-cli', 5, 30000);
        logger.info('OpenShift client initialized', {
            ocPath: this.ocPath,
            hasKubeconfig: !!this.kubeconfig,
            context: this.context,
            defaultNamespace: this.defaultNamespace,
            timeout: this.timeout
        });
    }
    /**
     * Validate configuration parameters synchronously
     */
    validateConfigurationSync(config) {
        // Validate timeout
        if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
            throw new Error('Timeout must be between 1-300 seconds');
        }
        // Validate namespace format
        if (config.defaultNamespace && !/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/.test(config.defaultNamespace)) {
            throw new Error('Invalid namespace format: must be lowercase alphanumeric with hyphens');
        }
        // Validate oc path format
        if (config.ocPath && (config.ocPath.includes('..') || config.ocPath.includes(';'))) {
            throw new Error('Invalid oc path: contains dangerous characters');
        }
    }
    /**
     * Validate configuration asynchronously (for file system checks)
     */
    async validateConfiguration() {
        try {
            // Test oc command availability
            await execAsync(`${this.ocPath} version --client`, { timeout: 5000 });
        }
        catch (error) {
            throw new Error(`OpenShift CLI not found or not working: ${this.ocPath}`);
        }
        // Validate kubeconfig file if specified
        if (this.kubeconfig) {
            try {
                await fs.access(this.kubeconfig, fs.constants.R_OK);
            }
            catch (error) {
                throw new Error(`Kubeconfig file not accessible: ${this.kubeconfig}`);
            }
        }
        logger.info('OpenShift client configuration validated');
    }
    /**
     * Enhanced argument sanitization with comprehensive security checks
     */
    sanitizeArgument(arg) {
        if (!arg || typeof arg !== 'string') {
            throw new Error('Invalid argument: must be non-empty string');
        }
        // Check for dangerous patterns
        const dangerousPatterns = [
            /[;&|`$(){}]/, // Command separators and substitution
            /\.\./, // Directory traversal
            /\0/, // Null bytes
            /[\r\n]/, // Line breaks
            /^-.*[^a-zA-Z0-9\-\.]/, // Suspicious options (allow normal flags)
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(arg)) {
                throw new Error(`Argument contains dangerous pattern: ${arg.substring(0, 50)}...`);
            }
        }
        // Length check
        if (arg.length > 1000) {
            throw new Error('Argument too long (max 1000 characters)');
        }
        return arg;
    }
    /**
     * Build environment for oc command execution
     */
    buildEnvironment() {
        const env = {};
        // Copy only defined environment variables
        Object.keys(process.env).forEach(key => {
            if (process.env[key]) {
                env[key] = process.env[key];
            }
        });
        if (this.kubeconfig) {
            env.KUBECONFIG = this.kubeconfig;
        }
        // Remove potentially dangerous environment variables
        delete env.LD_PRELOAD;
        delete env.LD_LIBRARY_PATH;
        return env;
    }
    /**
     * Execute oc command with enhanced security and resilience
     */
    async executeOcCommand(args) {
        // Sanitize all arguments
        const sanitizedArgs = args.map(arg => this.sanitizeArgument(arg));
        const command = `${this.ocPath} ${sanitizedArgs.join(' ')}`;
        const startTime = nowEpoch();
        logger.debug('Executing OpenShift command', {
            operation: sanitizedArgs[0],
            argsCount: sanitizedArgs.length,
            timeout: this.timeout
        });
        try {
            const result = await execAsync(command, {
                timeout: this.timeout,
                maxBuffer: 10 * 1024 * 1024, // 10MB
                env: this.buildEnvironment()
            });
            const duration = nowEpoch() - startTime;
            logger.info('OpenShift command completed', {
                operation: sanitizedArgs[0],
                duration,
                outputLength: result.stdout.length,
                success: true
            });
            return result.stdout.trim();
        }
        catch (error) {
            const duration = nowEpoch() - startTime;
            logger.error('OpenShift command failed', error instanceof Error ? error : new Error(String(error)), {
                operation: sanitizedArgs[0],
                duration,
                exitCode: (typeof error?.code === 'string' || typeof error?.code === 'number') ? error.code : undefined,
                // Truncate stderr for logging (avoid log pollution)
                stderr: typeof error?.stderr === 'string' ? error.stderr.substring(0, 200) : undefined
            });
            // Provide user-friendly error messages
            if ((typeof error?.code === 'string' || typeof error?.code === 'number') && error.code === 'ETIMEDOUT') {
                throw new Error(`OpenShift operation timed out: ${sanitizedArgs[0]}`);
            }
            else if (typeof error?.stderr === 'string' && error.stderr.includes('not found')) {
                throw new Error(`OpenShift resource not found: ${sanitizedArgs[0]}`);
            }
            else if (typeof error?.stderr === 'string' && error.stderr.includes('Unauthorized')) {
                throw new Error(`OpenShift authentication failed: ${sanitizedArgs[0]}`);
            }
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`OpenShift command failed: ${sanitizedArgs[0]} - ${msg}`);
        }
    }
    /**
     * Execute oc command with circuit breaker and request deduplication
     */
    async executeOcCommandWithResilience(args) {
        const commandKey = args.join(' ');
        // Deduplicate identical concurrent requests
        if (this.requestQueue.has(commandKey)) {
            logger.debug('Reusing in-flight request', { operation: args[0] });
            return this.requestQueue.get(commandKey);
        }
        const promise = this.circuitBreaker.execute(() => this.executeOcCommand(args)).finally(() => {
            this.requestQueue.delete(commandKey);
        });
        this.requestQueue.set(commandKey, promise);
        return promise;
    }
    /**
     * Get cluster information with caching and optimized concurrent operations
     */
    async getClusterInfo() {
        // Check cache first
        if (this.clusterInfoCache &&
            nowEpoch() - this.clusterInfoCache.timestamp < this.CACHE_TTL) {
            logger.debug('Using cached cluster info');
            return this.clusterInfoCache.data;
        }
        logger.info('Fetching fresh cluster info');
        const startTime = nowEpoch();
        try {
            // Execute operations concurrently with proper error handling
            const [versionResult, whoamiResult, projectResult] = await Promise.allSettled([
                this.executeOcCommandWithResilience(['version', '-o', 'json']),
                this.executeOcCommandWithResilience(['whoami']),
                this.executeOcCommandWithResilience(['project', '-q'])
            ]);
            // Get server URL separately (may require different permissions)
            const serverUrl = await this.getServerUrl().catch(() => 'unknown');
            const clusterInfo = {
                status: 'connected',
                version: this.parseVersionSafely(versionResult),
                currentUser: this.parseResultSafely(whoamiResult, 'unknown'),
                currentProject: this.parseResultSafely(projectResult, this.defaultNamespace || 'default'),
                serverUrl,
                timestamp: new Date().toISOString()
            };
            // Cache the result
            this.clusterInfoCache = {
                data: clusterInfo,
                timestamp: nowEpoch()
            };
            const duration = nowEpoch() - startTime;
            logger.info('Cluster info retrieved', { duration, cached: false });
            return clusterInfo;
        }
        catch (error) {
            logger.error('Failed to get cluster info', error instanceof Error ? error : new Error(String(error)));
            // Return minimal info if possible
            return {
                status: 'error',
                version: 'unknown',
                currentUser: 'unknown',
                currentProject: this.defaultNamespace || 'default',
                serverUrl: 'unknown',
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Safely parse Promise.allSettled results
     */
    parseResultSafely(result, defaultValue) {
        if (result.status === 'fulfilled') {
            return result.value.trim() || defaultValue;
        }
        else {
            logger.debug('Operation failed, using default', {
                reason: result.reason.message,
                default: defaultValue
            });
            return defaultValue;
        }
    }
    /**
     * Parse version output safely
     */
    parseVersionSafely(result) {
        if (result.status === 'fulfilled') {
            try {
                const versionData = JSON.parse(result.value);
                return versionData.clientVersion?.gitVersion || 'unknown';
            }
            catch (error) {
                logger.debug('Failed to parse version JSON, extracting from text');
                const match = result.value.match(/Client Version: ([\w\.-]+)/);
                const captured = match?.[1];
                return captured ?? 'unknown';
            }
        }
        return 'unknown';
    }
    /**
     * Get server URL with error handling
     */
    async getServerUrl() {
        try {
            const output = await this.executeOcCommandWithResilience(['whoami', '--show-server']);
            return output.trim();
        }
        catch (error) {
            logger.debug('Failed to get server URL', { errorMsg: error instanceof Error ? error.message : String(error) });
            return 'unknown';
        }
    }
    // ... Continue with other methods (getPods, getLogs, etc.) using the same enhanced patterns
    /**
     * Get pods with enhanced error handling and logging
     */
    async getPods(namespace, selector) {
        const args = ['get', 'pods', '-o', 'json'];
        if (namespace) {
            args.push('-n', namespace);
        }
        else if (this.defaultNamespace) {
            args.push('-n', this.defaultNamespace);
        }
        if (selector) {
            args.push('-l', selector);
        }
        try {
            const output = await this.executeOcCommandWithResilience(args);
            const podList = JSON.parse(output);
            return podList.items.map((pod) => ({
                name: pod.metadata.name,
                namespace: pod.metadata.namespace,
                status: pod.status.phase,
                ready: this.calculateReadyStatus(pod),
                restarts: this.calculateRestarts(pod),
                age: this.calculateAge(pod.metadata.creationTimestamp),
                node: pod.spec.nodeName
            }));
        }
        catch (error) {
            logger.error('Failed to get pods', error instanceof Error ? error : new Error(String(error)), { namespace, selector });
            throw error;
        }
    }
    // ... Additional helper methods with enhanced error handling
    calculateReadyStatus(pod) {
        const conditions = pod.status.conditions || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        return readyCondition?.status === 'True' ? '1/1' : '0/1';
    }
    calculateRestarts(pod) {
        const containers = pod.status.containerStatuses || [];
        return containers.reduce((total, container) => total + (container.restartCount || 0), 0);
    }
    calculateAge(creationTimestamp) {
        const created = new Date(creationTimestamp);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (diffDays > 0)
            return `${diffDays}d`;
        if (diffHours > 0)
            return `${diffHours}h`;
        return `${diffMinutes}m`;
    }
    /**
     * Clear cache (useful for testing or forced refresh)
     */
    clearCache() {
        this.clusterInfoCache = null;
        logger.debug('OpenShift client cache cleared');
    }
    /**
     * Get client health status
     */
    getHealth() {
        const issues = [];
        if (this.circuitBreaker['state'] === 'open') {
            issues.push('Circuit breaker is open');
        }
        if (this.requestQueue.size > 10) {
            issues.push(`High number of queued requests: ${this.requestQueue.size}`);
        }
        return {
            healthy: issues.length === 0,
            issues
        };
    }
}
