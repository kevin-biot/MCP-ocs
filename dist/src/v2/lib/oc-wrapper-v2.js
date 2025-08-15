/**
 * Enhanced OpenShift CLI Wrapper v2.0
 *
 * Based on CLI mapping cheatsheet with:
 * - Input sanitization and validation
 * - Timeout handling with configurable limits
 * - Caching for expensive operations
 * - Structured error handling
 * - Performance optimization
 */
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class OcWrapperV2 {
    ocPath;
    defaultTimeout;
    cache = new Map();
    constructor(ocPath = 'oc', defaultTimeout = 10000) {
        this.ocPath = ocPath;
        this.defaultTimeout = defaultTimeout;
    }
    /**
     * Execute oc command with safety and performance optimizations
     */
    async executeOc(args, options = {}) {
        const { timeout = this.defaultTimeout, namespace, retries = 3, cacheKey, cacheTTL = 30000 } = options;
        // Input validation and sanitization
        this.validateArgs(args);
        // Add namespace if specified
        const finalArgs = [...args];
        if (namespace) {
            this.validateNamespace(namespace);
            finalArgs.splice(1, 0, '-n', namespace);
        }
        // Check cache first
        const fullCacheKey = cacheKey ? `${cacheKey}:${finalArgs.join(':')}` : null;
        if (fullCacheKey && this.isValidCache(fullCacheKey)) {
            const cached = this.cache.get(fullCacheKey);
            return {
                stdout: cached.data,
                stderr: '',
                duration: 0,
                cached: true
            };
        }
        // Execute command with retry logic
        let lastError = null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const startTime = Date.now();
                const result = await this.executeWithTimeout(finalArgs, timeout);
                const duration = Date.now() - startTime;
                // Cache successful results
                if (fullCacheKey && result.stdout) {
                    this.cache.set(fullCacheKey, {
                        data: result.stdout,
                        timestamp: Date.now(),
                        ttl: cacheTTL
                    });
                }
                return {
                    stdout: result.stdout,
                    stderr: result.stderr,
                    duration,
                    cached: false
                };
            }
            catch (error) {
                lastError = error;
                if (attempt < retries) {
                    await this.delay(1000 * attempt); // Exponential backoff
                }
            }
        }
        throw new Error(`oc command failed after ${retries} attempts: ${lastError?.message}`);
    }
    /**
     * Get pods in namespace with structured output
     */
    async getPods(namespace) {
        const result = await this.executeOc(['get', 'pods', '-o', 'json'], {
            namespace,
            cacheKey: `pods:${namespace}`,
            cacheTTL: 15000 // 15s cache for pod data
        });
        try {
            return JSON.parse(result.stdout);
        }
        catch (error) {
            throw new Error(`Failed to parse pods JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get events in namespace
     */
    async getEvents(namespace) {
        // Reduce volume by excluding Normal events (focus on warnings/errors)
        const result = await this.executeOc(['get', 'events', '--field-selector', 'type!=Normal', '-o', 'json'], {
            namespace,
            cacheKey: `events:${namespace}`,
            cacheTTL: 10000 // 10s cache for events
        });
        try {
            return JSON.parse(result.stdout);
        }
        catch (error) {
            throw new Error(`Failed to parse events JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get PVCs in namespace
     */
    async getPVCs(namespace) {
        const result = await this.executeOc(['get', 'pvc', '-o', 'json'], {
            namespace,
            cacheKey: `pvcs:${namespace}`,
            cacheTTL: 20000 // 20s cache for PVCs
        });
        try {
            return JSON.parse(result.stdout);
        }
        catch (error) {
            throw new Error(`Failed to parse PVCs JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get routes in namespace (OpenShift)
     */
    async getRoutes(namespace) {
        try {
            const result = await this.executeOc(['get', 'route', '-o', 'json'], {
                namespace,
                cacheKey: `routes:${namespace}`,
                cacheTTL: 30000 // 30s cache for routes
            });
            return JSON.parse(result.stdout);
        }
        catch (error) {
            // Routes might not be available (vanilla Kubernetes)
            return { items: [] };
        }
    }
    /**
     * Get deployments in namespace
     */
    async getDeployments(namespace) {
        const result = await this.executeOc(['get', 'deployments', '-o', 'json'], {
            namespace,
            cacheKey: `deployments:${namespace}`,
            cacheTTL: 20000 // 20s cache for deployments
        });
        try {
            return JSON.parse(result.stdout);
        }
        catch (error) {
            throw new Error(`Failed to parse deployments JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get ingress in namespace (Kubernetes fallback)
     */
    async getIngress(namespace) {
        try {
            const result = await this.executeOc(['get', 'ingress', '-o', 'json'], {
                namespace,
                cacheKey: `ingress:${namespace}`,
                cacheTTL: 30000
            });
            return JSON.parse(result.stdout);
        }
        catch (error) {
            return { items: [] };
        }
    }
    /**
     * Validate namespace exists
     */
    async validateNamespaceExists(namespace) {
        try {
            await this.executeOc(['get', 'namespace', namespace], { timeout: 5000 });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Clear cache for namespace
     */
    clearNamespaceCache(namespace) {
        const keysToRemove = Array.from(this.cache.keys())
            .filter(key => key.includes(`:${namespace}`));
        keysToRemove.forEach(key => this.cache.delete(key));
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        // Simple cache stats for monitoring
        return {
            size: this.cache.size,
            hitRate: 0.85 // Placeholder - implement actual tracking
        };
    }
    // Private helper methods
    async executeWithTimeout(args, timeout) {
        const command = `${this.ocPath} ${args.join(' ')}`;
        // DEBUG: Log environment information
        console.error(`🔧 Executing: ${command}`);
        console.error(`🔧 KUBECONFIG: ${process.env.KUBECONFIG || 'NOT SET'}`);
        console.error(`🔧 Current working directory: ${process.cwd()}`);
        try {
            const result = await execAsync(command, {
                timeout,
                maxBuffer: 16 * 1024 * 1024, // 16MB to handle large JSON outputs
                env: { ...process.env, KUBECONFIG: process.env.KUBECONFIG }
            });
            return result;
        }
        catch (error) {
            console.error(`❌ Command failed: ${command}`);
            console.error(`❌ Error: ${error.message}`);
            if (error.code === 'ETIMEDOUT') {
                throw new Error(`Command timed out after ${timeout}ms: ${command}`);
            }
            throw new Error(`Command failed: ${command} - ${error.message}`);
        }
    }
    validateArgs(args) {
        // Prevent command injection
        const invalidChars = /[;&|`$(){}[\]<>]/;
        for (const arg of args) {
            if (typeof arg !== 'string') {
                throw new Error(`Invalid argument type: ${typeof arg}`);
            }
            if (invalidChars.test(arg)) {
                throw new Error(`Invalid characters in argument: ${arg}`);
            }
        }
        if (args.length === 0) {
            throw new Error('No arguments provided');
        }
    }
    validateNamespace(namespace) {
        // Kubernetes namespace naming rules
        const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
        if (!namespaceRegex.test(namespace)) {
            throw new Error(`Invalid namespace name: ${namespace}`);
        }
        if (namespace.length > 63) {
            throw new Error(`Namespace name too long: ${namespace.length} characters`);
        }
    }
    isValidCache(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached)
            return false;
        const age = Date.now() - cached.timestamp;
        return age < cached.ttl;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
