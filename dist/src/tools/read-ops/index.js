/**
 * Read Operations Tools - Safe data retrieval operations
 *
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
 */
import { nowIso, nowEpoch } from '../../utils/time.js';
import { createSessionId } from '../../utils/session.js';
import { ToolMemoryGateway } from '../../lib/tools/tool-memory-gateway.js';
export class ReadOpsTools {
    openshiftClient;
    memoryManager;
    category = 'read-ops';
    version = 'v2';
    constructor(openshiftClient, memoryManager) {
        this.openshiftClient = openshiftClient;
        this.memoryManager = memoryManager;
        this.memoryGateway = new ToolMemoryGateway('./memory');
    }
    memoryGateway;
    getTools() {
        const toolDefinitions = this.getToolDefinitions();
        return toolDefinitions.map(tool => this.convertToStandardTool(tool));
    }
    getToolDefinitions() {
        return [
            {
                name: 'get_pods',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_get_pods',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'List pods in a namespace with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        namespaceList: {
                            anyOf: [
                                { type: 'array', items: { type: 'string' } },
                                { type: 'string' }
                            ],
                            description: 'Optional list of namespaces (comma-separated string or array) for batched enumeration'
                        },
                        selector: {
                            type: 'string',
                            description: 'Label selector (optional)'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    }
                },
                priority: 95
            },
            {
                name: 'describe_resource',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_describe',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'advanced', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get detailed information about a specific resource',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resourceType: {
                            type: 'string',
                            description: 'Type of resource (pod, deployment, service, etc.)'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the resource'
                        },
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['resourceType', 'name']
                },
                priority: 90
            },
            {
                name: 'get_logs',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_logs',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'advanced', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Retrieve logs from a pod or container',
                inputSchema: {
                    type: 'object',
                    properties: {
                        podName: {
                            type: 'string',
                            description: 'Name of the pod'
                        },
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        container: {
                            type: 'string',
                            description: 'Specific container name (optional)'
                        },
                        lines: {
                            type: 'number',
                            description: 'Number of lines to retrieve (default: 100)',
                            default: 100
                        },
                        since: {
                            type: 'string',
                            description: 'Time range (e.g., "1h", "30m")'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['podName']
                },
                priority: 85
            },
            {
                name: 'search_memory',
                namespace: 'mcp-memory',
                fullName: 'memory_search_incidents',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Search operational memory for similar incidents and patterns',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for finding similar incidents'
                        },
                        domainFilter: {
                            type: 'string',
                            description: 'Optional domain filter',
                            enum: ['openshift', 'kubernetes', 'devops', 'production']
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results (default: 5)',
                            default: 5
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['query']
                },
                priority: 80
            }
        ];
    }
    convertToStandardTool(toolDef) {
        return {
            name: toolDef.name,
            fullName: toolDef.fullName,
            description: toolDef.description,
            inputSchema: toolDef.inputSchema,
            category: 'read-ops',
            version: 'v2',
            execute: async (args) => this.executeTool(toolDef.fullName, args)
        };
    }
    async executeTool(toolName, args) {
        const asRecord = (v) => (v && typeof v === 'object') ? v : {};
        const raw = asRecord(args);
        const sessionId = typeof raw.sessionId === 'string' ? raw.sessionId : createSessionId('read');
        try {
            let result;
            switch (toolName) {
                case 'oc_read_get_pods':
                    {
                        const nsArg = typeof raw.namespace === 'string' ? raw.namespace
                            : (Array.isArray(raw.namespaceList) ? raw.namespaceList.join(',')
                                : (typeof raw.namespaceList === 'string' ? String(raw.namespaceList) : undefined));
                        result = await this.getPods(nsArg, typeof raw.selector === 'string' ? raw.selector : undefined, sessionId);
                    }
                    break;
                case 'oc_read_describe':
                    result = await this.describeResource(String(raw.resourceType ?? ''), String(raw.name ?? ''), typeof raw.namespace === 'string' ? raw.namespace : undefined, sessionId);
                    break;
                case 'oc_read_logs':
                    result = await this.getLogs(String(raw.podName ?? ''), typeof raw.namespace === 'string' ? raw.namespace : undefined, typeof raw.container === 'string' ? raw.container : undefined, typeof raw.lines === 'number' ? raw.lines : (typeof raw.lines === 'string' ? Number(raw.lines) || undefined : undefined), typeof raw.since === 'string' ? raw.since : undefined, sessionId);
                    break;
                case 'memory_search_incidents':
                    result = await this.searchMemory(String(raw.query ?? ''), typeof raw.limit === 'number' ? raw.limit : (typeof raw.limit === 'string' ? Number(raw.limit) || undefined : undefined), sessionId, (() => {
                        const v = raw.domainFilter;
                        const s = typeof v === 'string' ? v : undefined;
                        return s === 'openshift' || s === 'kubernetes' || s === 'devops' || s === 'production' ? s : undefined;
                    })());
                    break;
                default:
                    throw new Error(`Unknown read operation tool: ${toolName}`);
            }
            // Enhanced error handling: check for method existence before calling
            if (toolName === 'oc_read_describe' && typeof this.openshiftClient.describeResource !== 'function') {
                throw new Error('describeResource method not implemented in OpenShiftClient');
            }
            // Safely convert result to JSON with size limits and sanitization
            const jsonResult = this.safeJsonStringify(result);
            return jsonResult;
        }
        catch (error) {
            console.error(`❌ Read operation ${toolName} failed:`, error);
            // Enhanced error handling to prevent MCP corruption
            const errorResult = {
                success: false,
                tool: toolName,
                error: this.sanitizeError(error),
                timestamp: nowIso(),
                args: this.sanitizeArgs(args)
            };
            return this.safeJsonStringify(errorResult);
        }
    }
    async getPods(namespace, selector, sessionId) {
        console.error(`📋 Getting pods - namespace: ${namespace}, selector: ${selector}`);
        // Support comma-separated multi-namespace input for batched enumeration
        const targets = (namespace && namespace.includes(','))
            ? namespace.split(',').map(s => s.trim()).filter(Boolean)
            : (namespace ? [namespace] : []);
        const conc = Number(process.env.OC_READ_PODS_CONCURRENCY || process.env.OC_DIAG_POD_CONCURRENCY || process.env.OC_DIAG_CONCURRENCY || 8);
        const timeoutMs = Number(process.env.OC_READ_PODS_TIMEOUT_MS || process.env.OC_DIAG_POD_TIMEOUT_MS || process.env.OC_DIAG_TIMEOUT_MS || 5000);
        if (targets.length <= 1) {
            const pods = await this.openshiftClient.getPods(namespace, selector);
            const result = {
                namespace: namespace || 'default',
                selector: selector || 'none',
                totalPods: pods.length,
                pods: pods,
                summary: {
                    running: pods.filter(p => p.status === 'Running').length,
                    pending: pods.filter(p => p.status === 'Pending').length,
                    failed: pods.filter(p => p.status === 'Failed').length,
                    unknown: pods.filter(p => !['Running', 'Pending', 'Failed'].includes(p.status)).length
                },
                timestamp: nowIso()
            };
            await this.memoryGateway.storeToolExecution('oc_read_get_pods', { namespace: namespace || 'default', selector: selector || 'none' }, result, sessionId || 'unknown', ['read_operation', 'pods', 'cluster_state'], 'openshift', 'prod', 'low');
            await this.memoryManager.storeConversation({
                sessionId: sessionId || 'unknown',
                domain: 'cluster',
                timestamp: nowEpoch(),
                userMessage: `Get pods ${namespace || 'default'} ${selector || ''}`.trim(),
                assistantResponse: `Found ${result.totalPods} pods (running=${result.summary.running})`,
                context: [namespace || 'default', selector || 'none'],
                tags: ['read_operation', 'get_pods']
            });
            return result;
        }
        // Batched multi-namespace enumeration with bounded concurrency and timeout
        const namespaces = targets;
        const maxConcurrent = Math.max(1, conc);
        const timeoutPerNamespace = Math.max(1000, timeoutMs);
        const results = [];
        let apiCalls = 0;
        const started = nowEpoch();
        for (let i = 0; i < namespaces.length; i += maxConcurrent) {
            const batch = namespaces.slice(i, i + maxConcurrent);
            const promises = batch.map(async (ns) => {
                try {
                    const pods = await Promise.race([
                        this.openshiftClient.getPods(ns, selector),
                        new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout:${ns}`)), timeoutPerNamespace))
                    ]);
                    apiCalls += 1;
                    const summary = {
                        running: pods.filter(p => p.status === 'Running').length,
                        pending: pods.filter(p => p.status === 'Pending').length,
                        failed: pods.filter(p => p.status === 'Failed').length,
                        unknown: pods.filter(p => !['Running', 'Pending', 'Failed'].includes(p.status)).length
                    };
                    results.push({ namespace: ns, totalPods: pods.length, summary });
                }
                catch {
                    results.push({ namespace: ns, totalPods: 0, summary: { running: 0, pending: 0, failed: 0, unknown: 0 } });
                }
            });
            await Promise.allSettled(promises);
        }
        const durationMs = nowEpoch() - started;
        const aggregated = {
            success: true,
            mode: 'batched',
            selector: selector || 'none',
            namespaces: results,
            apiCalls,
            durationMs,
            timestamp: nowIso()
        };
        await this.memoryGateway.storeToolExecution('oc_read_get_pods', { namespace: namespaces.join(','), selector: selector || 'none', mode: 'batched', concurrency: maxConcurrent }, aggregated, sessionId || 'unknown', ['read_operation', 'pods', 'batched'], 'openshift', 'prod', 'low');
        await this.memoryManager.storeConversation({
            sessionId: sessionId || 'unknown',
            domain: 'cluster',
            timestamp: nowEpoch(),
            userMessage: `Get pods batched ${namespaces.length} namespaces`,
            assistantResponse: `API calls ${apiCalls}, duration ${durationMs}ms`,
            context: [String(namespaces.length), selector || 'none'],
            tags: ['read_operation', 'get_pods', 'batched']
        });
        return aggregated;
    }
    async describeResource(resourceType, name, namespace, sessionId) {
        console.error(`🔍 Describing ${resourceType}/${name} in namespace: ${namespace}`);
        const lowerName = String(name || '').toLowerCase();
        const lowerNs = typeof namespace === 'string' ? namespace.toLowerCase() : undefined;
        const conc = Number(process.env.OC_READ_DESCRIBE_CONCURRENCY || process.env.OC_DIAG_CONCURRENCY || 8);
        const timeoutMs = Number(process.env.OC_READ_DESCRIBE_TIMEOUT_MS || process.env.OC_DIAG_TIMEOUT_MS || 5000);
        // Expansion logic for name='all' and/or namespace='all'
        if (lowerName === 'all' || lowerNs === 'all') {
            // List resources according to scope
            const listNs = lowerNs === 'all' ? 'all' : (namespace || undefined);
            let targets = await this.openshiftClient.listResources(resourceType, listNs);
            if (lowerName !== 'all') {
                targets = targets.filter(t => t.name === name);
            }
            const maxConcurrent = Math.max(1, conc);
            const perTimeout = Math.max(1000, timeoutMs);
            const results = [];
            const startedAll = nowEpoch();
            for (let i = 0; i < targets.length; i += maxConcurrent) {
                const batch = targets.slice(i, i + maxConcurrent);
                const promises = batch.map(async (t) => {
                    const t0 = nowEpoch();
                    try {
                        const desc = await Promise.race([
                            this.openshiftClient.describeResource(resourceType, t.name, t.namespace),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), perTimeout))
                        ]);
                        const dt = nowEpoch() - t0;
                        const item = { name: t.name, ok: true, durationMs: dt, description: desc };
                        if (t.namespace)
                            item.namespace = t.namespace;
                        results.push(item);
                    }
                    catch (e) {
                        const dt = nowEpoch() - t0;
                        const msg = e instanceof Error ? e.message : String(e);
                        const item = { name: t.name, ok: false, durationMs: dt, error: msg };
                        if (t.namespace)
                            item.namespace = t.namespace;
                        results.push(item);
                    }
                });
                await Promise.allSettled(promises);
            }
            const aggregated = {
                success: true,
                mode: 'expanded',
                resourceType,
                input: { name, namespace: namespace || this.openshiftClient['config']?.namespace || 'default' },
                count: results.length,
                durationMs: nowEpoch() - startedAll,
                results,
                timestamp: nowIso()
            };
            // Store summary (avoid huge payloads)
            await this.memoryGateway.storeToolExecution('oc_read_describe', { resourceType, name, namespace: namespace || 'default', mode: 'expanded', concurrency: maxConcurrent }, { count: aggregated.count, durationMs: aggregated.durationMs }, sessionId || 'unknown', ['read_operation', 'describe', resourceType, 'expanded'], 'openshift', 'prod', 'low');
            return aggregated;
        }
        // Simple single describe
        const description = await this.openshiftClient.describeResource(resourceType, name, namespace);
        const result = {
            resourceType,
            name,
            namespace: namespace || 'default',
            description,
            timestamp: nowIso()
        };
        await this.memoryGateway.storeToolExecution('oc_read_describe', { resourceType, name, namespace: namespace || 'default' }, result, sessionId || 'unknown', ['read_operation', 'describe', resourceType], 'openshift', 'prod', 'low');
        return result;
    }
    async getLogs(podName, namespace, container, lines, since, sessionId) {
        console.error(`📄 Getting logs from pod: ${podName}, container: ${container}, lines: ${lines}`);
        const logOpts = { lines: lines || 100 };
        if (typeof container === 'string')
            logOpts.container = container;
        if (typeof since === 'string')
            logOpts.since = since;
        const logs = await this.openshiftClient.getLogs(podName, namespace, logOpts);
        const result = {
            podName,
            namespace: namespace || 'default',
            container: container || 'default',
            lines: lines || 100,
            since,
            logs,
            logLines: logs.split('\\n').length,
            timestamp: nowIso()
        };
        // Store via adapter-backed gateway for Chroma v2 integration
        await this.memoryGateway.storeToolExecution('oc_read_logs', { podName, namespace: namespace || 'default', container: container || 'default', lines: lines || 100, since }, result, sessionId || 'unknown', ['read_operation', 'logs', 'troubleshooting'], 'openshift', 'prod', 'low');
        // Also persist conversational trace (unit test expectation)
        await this.memoryManager.storeConversation({
            sessionId: sessionId || 'unknown',
            domain: 'cluster',
            timestamp: nowEpoch(),
            userMessage: `Read logs ${podName}`,
            assistantResponse: `Returned ${result.logLines} line segments`,
            context: [namespace || 'default', container || 'default'],
            tags: ['read_operation', 'logs']
        });
        return result;
    }
    async searchMemory(query, limit, sessionId, domainFilter) {
        console.error(`🧠 Searching operational memory for: ${query}`);
        // Prefer direct memory manager so unit tests can mock searchOperational
        let results = [];
        try {
            const maybeSearch = this.memoryManager?.searchOperational;
            if (typeof maybeSearch === 'function') {
                results = await maybeSearch.call(this.memoryManager, query, limit || 5);
            }
            else {
                results = await this.memoryGateway.searchToolIncidents(query, domainFilter, limit || 5);
            }
        }
        catch {
            results = [];
        }
        const searchResult = {
            query,
            limit: limit || 5,
            resultsFound: results.length,
            results: results.map((r) => ({
                similarity: r.similarity ?? (typeof r.distance === 'number' ? (1 - r.distance) : 0.5),
                relevance: r.relevance ?? (typeof r.distance === 'number' ? (1 - r.distance) * 100 : 50),
                incidentId: r.memory?.incidentId || r.metadata?.incidentId || '',
                symptoms: r.memory?.symptoms || [],
                resolution: r.memory?.resolution || '',
                timestamp: r.memory?.timestamp || r.metadata?.timestamp || nowIso()
            })),
            timestamp: nowIso()
        };
        // Store search in memory for analytics
        await this.memoryManager.storeConversation({
            sessionId: sessionId || 'unknown',
            domain: 'knowledge',
            timestamp: nowEpoch(),
            userMessage: `Search memory for: ${query}`,
            assistantResponse: `Found ${results.length} relevant incidents in operational memory`,
            context: ['memory_search', query],
            tags: ['memory_operation', 'knowledge_retrieval', 'pattern_matching']
        });
        return searchResult;
    }
    /**
     * Enhanced error handling and sanitization methods
     */
    safeJsonStringify(obj) {
        try {
            // Check object size before stringifying
            const testStr = JSON.stringify(obj);
            // If response is too large (>500KB), truncate it
            if (testStr.length > 500000) {
                console.error('⚠️ Large response detected, truncating...');
                if (typeof obj === 'object' && obj.description) {
                    // For describe operations, truncate the description field
                    const truncated = {
                        ...obj,
                        description: obj.description.substring(0, 100000) + '\n\n[... truncated due to size limit ...]',
                        truncated: true,
                        originalSize: testStr.length
                    };
                    return JSON.stringify(truncated, null, 2);
                }
            }
            return JSON.stringify(obj, null, 2);
        }
        catch (error) {
            console.error('❌ JSON stringify failed:', error);
            // Fallback to safe string representation
            return JSON.stringify({
                success: false,
                error: 'Failed to serialize response',
                message: 'Response contained non-serializable data',
                timestamp: nowIso()
            }, null, 2);
        }
    }
    sanitizeError(error) {
        if (error instanceof Error) {
            // Clean error message of any potential special characters that could break MCP
            return error.message.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
        }
        if (typeof error === 'string') {
            return error.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
        }
        return 'Unknown error type';
    }
    sanitizeArgs(args) {
        // Remove potentially problematic fields from args for error reporting
        const sanitized = { ...args };
        // Remove large or sensitive fields
        delete sanitized.sessionId;
        return sanitized;
    }
}
