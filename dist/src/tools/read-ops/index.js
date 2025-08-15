/**
 * Read Operations Tools - Safe data retrieval operations
 *
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
 */
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
        const sessionId = args.sessionId || `read-${Date.now()}`;
        try {
            let result;
            switch (toolName) {
                case 'oc_read_get_pods':
                    result = await this.getPods(args.namespace, args.selector, sessionId);
                    break;
                case 'oc_read_describe':
                    result = await this.describeResource(args.resourceType, args.name, args.namespace, sessionId);
                    break;
                case 'oc_read_logs':
                    result = await this.getLogs(args.podName, args.namespace, args.container, args.lines, args.since, sessionId);
                    break;
                case 'memory_search_incidents':
                    result = await this.searchMemory(args.query, args.limit, sessionId, args.domainFilter);
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
                timestamp: new Date().toISOString(),
                args: this.sanitizeArgs(args)
            };
            return this.safeJsonStringify(errorResult);
        }
    }
    async getPods(namespace, selector, sessionId) {
        console.error(`📋 Getting pods - namespace: ${namespace}, selector: ${selector}`);
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
            timestamp: new Date().toISOString()
        };
        // Store via adapter-backed gateway for Chroma v2 integration
        await this.memoryGateway.storeToolExecution('oc_read_get_pods', { namespace: namespace || 'default', selector: selector || 'none' }, result, sessionId || 'unknown', ['read_operation', 'pods', 'cluster_state'], 'openshift', 'prod', 'low');
        return result;
    }
    async describeResource(resourceType, name, namespace, sessionId) {
        console.error(`🔍 Describing ${resourceType}/${name} in namespace: ${namespace}`);
        const description = await this.openshiftClient.describeResource(resourceType, name, namespace);
        const result = {
            resourceType,
            name,
            namespace: namespace || 'default',
            description,
            timestamp: new Date().toISOString()
        };
        // Store via adapter-backed gateway for Chroma v2 integration
        await this.memoryGateway.storeToolExecution('oc_read_describe', { resourceType, name, namespace: namespace || 'default' }, result, sessionId || 'unknown', ['read_operation', 'describe', resourceType], 'openshift', 'prod', 'low');
        return result;
    }
    async getLogs(podName, namespace, container, lines, since, sessionId) {
        console.error(`📄 Getting logs from pod: ${podName}, container: ${container}, lines: ${lines}`);
        const logs = await this.openshiftClient.getLogs(podName, namespace, {
            container,
            lines: lines || 100,
            since
        });
        const result = {
            podName,
            namespace: namespace || 'default',
            container: container || 'default',
            lines: lines || 100,
            since,
            logs,
            logLines: logs.split('\\n').length,
            timestamp: new Date().toISOString()
        };
        // Store via adapter-backed gateway for Chroma v2 integration
        await this.memoryGateway.storeToolExecution('oc_read_logs', { podName, namespace: namespace || 'default', container: container || 'default', lines: lines || 100, since }, result, sessionId || 'unknown', ['read_operation', 'logs', 'troubleshooting'], 'openshift', 'prod', 'low');
        return result;
    }
    async searchMemory(query, limit, sessionId, domainFilter) {
        console.error(`🧠 Searching operational memory for: ${query}`);
        // Use adapter-backed gateway for incidents search (domain filtering supported)
        const results = await this.memoryGateway.searchToolIncidents(query, domainFilter, limit || 5);
        const searchResult = {
            query,
            limit: limit || 5,
            resultsFound: results.length,
            results: results.map((r) => ({
                // Approximate similarity from distance if present
                similarity: typeof r.distance === 'number' ? (1 - r.distance) : 0.5,
                relevance: typeof r.distance === 'number' ? (1 - r.distance) * 100 : 50,
                incidentId: r.metadata?.incidentId || '',
                symptoms: [],
                resolution: '',
                timestamp: r.metadata?.timestamp || Date.now()
            })),
            timestamp: new Date().toISOString()
        };
        // Store search in memory for analytics
        await this.memoryManager.storeConversation({
            sessionId: sessionId || 'unknown',
            domain: 'knowledge',
            timestamp: Date.now(),
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
                timestamp: new Date().toISOString()
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
