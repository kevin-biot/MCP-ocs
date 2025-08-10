/**
 * State Management Tools - Memory and workflow state operations
 *
 * Following ADR-004 namespace conventions: oc_state_*
 * Tools for managing workflow state and operational memory
 */
export class StateMgmtTools {
    memoryManager;
    workflowEngine;
    constructor(memoryManager, workflowEngine) {
        this.memoryManager = memoryManager;
        this.workflowEngine = workflowEngine;
    }
    getTools() {
        return [
            {
                name: 'store_incident',
                namespace: 'mcp-memory',
                fullName: 'memory_store_operational',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Store an incident resolution in operational memory for future reference',
                inputSchema: {
                    type: 'object',
                    properties: {
                        incidentId: {
                            type: 'string',
                            description: 'Unique identifier for the incident'
                        },
                        symptoms: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of observed symptoms'
                        },
                        rootCause: {
                            type: 'string',
                            description: 'Identified root cause of the incident'
                        },
                        resolution: {
                            type: 'string',
                            description: 'How the incident was resolved'
                        },
                        affectedResources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of affected resources'
                        },
                        environment: {
                            type: 'string',
                            enum: ['dev', 'test', 'staging', 'prod'],
                            description: 'Environment where incident occurred'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['incidentId', 'symptoms', 'environment']
                },
                priority: 70
            },
            {
                name: 'get_workflow_state',
                namespace: 'mcp-core',
                fullName: 'core_workflow_state',
                domain: 'system',
                capabilities: [
                    { type: 'state', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get current workflow state for a session',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: {
                            type: 'string',
                            description: 'Session ID to query'
                        }
                    },
                    required: ['sessionId']
                },
                priority: 75
            },
            {
                name: 'memory_stats',
                namespace: 'mcp-memory',
                fullName: 'memory_get_stats',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get memory system statistics and health information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detailed: {
                            type: 'boolean',
                            description: 'Include detailed breakdown of memory usage',
                            default: false
                        }
                    }
                },
                priority: 65
            },
            {
                name: 'search_conversations',
                namespace: 'mcp-memory',
                fullName: 'memory_search_conversations',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Search conversation memory for relevant context',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for finding relevant conversations'
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
                priority: 60
            }
        ];
    }
    async executeTool(toolName, args) {
        const sessionId = args.sessionId || `state-${Date.now()}`;
        try {
            switch (toolName) {
                case 'memory_store_operational':
                    return await this.storeIncident(args, sessionId);
                case 'core_workflow_state':
                    return await this.getWorkflowState(args.sessionId);
                case 'memory_get_stats':
                    return await this.getMemoryStats(args.detailed);
                case 'memory_search_conversations':
                    return await this.searchConversations(args.query, args.limit, sessionId);
                default:
                    throw new Error(`Unknown state management tool: ${toolName}`);
            }
        }
        catch (error) {
            console.error(`❌ State management operation ${toolName} failed:`, error);
            throw error;
        }
    }
    async storeIncident(args, sessionId) {
        console.error(`💾 Storing incident: ${args.incidentId}`);
        const operational = {
            incidentId: args.incidentId,
            domain: 'cluster',
            timestamp: Date.now(),
            symptoms: args.symptoms || [],
            rootCause: args.rootCause,
            resolution: args.resolution,
            environment: args.environment,
            affectedResources: args.affectedResources || [],
            diagnosticSteps: [], // Would be populated from workflow history
            tags: ['manual_entry', 'incident_resolution']
        };
        const memoryId = await this.memoryManager.storeOperational(operational);
        const result = {
            operation: 'store_incident',
            incidentId: args.incidentId,
            memoryId,
            status: 'success',
            timestamp: new Date().toISOString()
        };
        // Store the storage operation itself as a conversation
        await this.memoryManager.storeConversation({
            sessionId,
            domain: 'knowledge',
            timestamp: Date.now(),
            userMessage: `Store incident ${args.incidentId}`,
            assistantResponse: `Successfully stored incident ${args.incidentId} in operational memory`,
            context: ['incident_storage', args.incidentId],
            tags: ['memory_operation', 'incident_management']
        });
        return result;
    }
    async getWorkflowState(sessionId) {
        console.error(`📊 Getting workflow state for session: ${sessionId}`);
        const workflowStates = await this.workflowEngine.getActiveStates();
        // Find the specific session
        const sessionState = workflowStates.sessions.find((s) => s.sessionId === sessionId);
        const result = {
            sessionId,
            found: !!sessionState,
            state: sessionState || null,
            allActiveSessions: workflowStates.activeSessions,
            timestamp: new Date().toISOString()
        };
        return result;
    }
    async getMemoryStats(detailed) {
        console.error(`📈 Getting memory system statistics (detailed: ${detailed})`);
        const stats = await this.memoryManager.getStats();
        const result = {
            ...stats,
            detailed: detailed || false,
            timestamp: new Date().toISOString()
        };
        if (detailed) {
            // Add more detailed information
            result.details = {
                memoryBreakdown: {
                    conversationMemory: `${stats.totalConversations} entries`,
                    operationalMemory: `${stats.totalOperational} incidents`,
                    storageBackend: stats.chromaAvailable ? 'ChromaDB + JSON' : 'JSON only'
                },
                systemHealth: {
                    chromaStatus: stats.chromaAvailable ? 'available' : 'unavailable',
                    storageLocation: stats.namespace,
                    lastCleanup: stats.lastCleanup
                }
            };
        }
        return result;
    }
    async searchConversations(query, limit, sessionId) {
        console.error(`🔍 Searching conversation memory for: ${query}`);
        const results = await this.memoryManager.searchConversations(query, limit || 5);
        const searchResult = {
            query,
            limit: limit || 5,
            resultsFound: results.length,
            results: results.map(r => ({
                similarity: r.similarity,
                relevance: r.relevance,
                sessionId: 'sessionId' in r.memory ? r.memory.sessionId : '',
                domain: r.memory.domain,
                userMessage: 'userMessage' in r.memory ? r.memory.userMessage : '',
                assistantResponse: 'assistantResponse' in r.memory ? r.memory.assistantResponse : '',
                timestamp: r.memory.timestamp,
                tags: r.memory.tags
            })),
            timestamp: new Date().toISOString()
        };
        // Store search in memory for analytics
        if (sessionId) {
            await this.memoryManager.storeConversation({
                sessionId,
                domain: 'knowledge',
                timestamp: Date.now(),
                userMessage: `Search conversations for: ${query}`,
                assistantResponse: `Found ${results.length} relevant conversations`,
                context: ['conversation_search', query],
                tags: ['memory_operation', 'conversation_search']
            });
        }
        return searchResult;
    }
}
