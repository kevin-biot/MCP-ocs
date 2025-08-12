/**
 * Auto-Memory Integration System
 * Automatically captures and tags tool executions for future pattern recognition
 */
export class AutoMemorySystem {
    memoryManager;
    constructor(memoryManager) {
        this.memoryManager = memoryManager;
    }
    /**
     * Automatically capture and tag tool execution for future retrieval
     */
    async captureToolExecution(context) {
        try {
            // Generate smart tags based on tool execution
            const tags = this.generateSmartTags(context);
            // Store as operational memory for incident correlation
            await this.storeAsOperationalMemory(context, tags);
            // Store as conversation memory for workflow tracking
            await this.storeAsConversationMemory(context, tags);
            console.error(`🔖 Auto-captured: ${context.toolName} with ${tags.length} tags`);
        }
        catch (error) {
            console.error(`❌ Failed to auto-capture tool execution:`, error);
        }
    }
    /**
     * Check for relevant past experiences before tool execution
     */
    async retrieveRelevantContext(toolName, args) {
        try {
            // Build search query based on tool and context
            const searchQueries = this.buildContextualQueries(toolName, args);
            const relevantMemories = [];
            for (const query of searchQueries) {
                const results = await this.memoryManager.searchOperational(query, 3);
                relevantMemories.push(...results);
            }
            // Filter and rank by relevance
            return this.rankRelevantMemories(relevantMemories, toolName, args);
        }
        catch (error) {
            console.error(`❌ Failed to retrieve relevant context:`, error);
            return [];
        }
    }
    /**
     * Generate smart tags based on tool execution patterns
     */
    generateSmartTags(context) {
        const tags = [];
        // Core tool category
        if (context.toolName.startsWith('oc_diagnostic_')) {
            tags.push('diagnostic_tool', 'red_zone_relevant');
        }
        else if (context.toolName.startsWith('oc_read_')) {
            tags.push('read_operation', 'data_gathering');
        }
        else if (context.toolName.startsWith('memory_')) {
            tags.push('memory_operation', 'workflow_tracking');
        }
        // Context-specific tags from arguments
        if (context.arguments.namespace) {
            tags.push(`namespace:${context.arguments.namespace}`);
            // Special namespace patterns
            if (context.arguments.namespace.includes('student04')) {
                tags.push('student04_pattern', 'ci_cd_artifacts', 'build_pipeline');
            }
        }
        // Result-based pattern recognition
        if (context.result && typeof context.result === 'string') {
            const resultData = JSON.parse(context.result);
            // Cluster health patterns
            if (resultData.overallHealth === 'degraded') {
                tags.push('cluster_degraded', 'high_priority', 'red_zone_critical');
            }
            // Pod patterns
            if (resultData.pods && Array.isArray(resultData.pods)) {
                tags.push('pod_analysis', `pod_count:${resultData.pods.length}`);
                // Look for specific patterns
                const succeededNotReady = resultData.pods.filter((p) => p.status === 'Succeeded' && p.ready === '0/1');
                if (succeededNotReady.length > 0) {
                    tags.push('build_artifacts_pattern', 'pods_succeeded_not_ready', 'ci_cd_pattern');
                }
            }
            // PVC patterns
            if (resultData.pvcs && Array.isArray(resultData.pvcs)) {
                const pendingPVCs = resultData.pvcs.filter((pvc) => pvc.status === 'Pending');
                if (pendingPVCs.length > 0) {
                    tags.push('pvc_pending', 'storage_analysis');
                }
            }
        }
        // Performance and success tags
        if (context.success) {
            tags.push('execution_success');
        }
        else {
            tags.push('execution_failed', 'needs_investigation');
        }
        if (context.duration > 5000) {
            tags.push('slow_execution', 'performance_concern');
        }
        return tags;
    }
    /**
     * Store execution as operational memory for incident correlation
     */
    async storeAsOperationalMemory(context, tags) {
        const symptoms = this.extractSymptoms(context);
        const affectedResources = this.extractAffectedResources(context);
        await this.memoryManager.storeOperational({
            incidentId: `tool-execution-${context.sessionId}-${context.timestamp}`,
            domain: this.extractDomain(context.toolName),
            timestamp: context.timestamp,
            symptoms,
            rootCause: context.success ? 'successful_operation' : (context.error || 'unknown_error'),
            resolution: context.success ? 'completed_successfully' : 'operation_failed',
            affectedResources,
            diagnosticSteps: [`Executed ${context.toolName}`],
            tags,
            environment: 'prod'
        });
    }
    /**
     * Store execution as conversation memory for workflow tracking
     */
    async storeAsConversationMemory(context, tags) {
        await this.memoryManager.storeConversation({
            sessionId: context.sessionId,
            domain: this.extractDomain(context.toolName),
            timestamp: context.timestamp,
            userMessage: `Execute ${context.toolName} with args: ${JSON.stringify(context.arguments)}`,
            assistantResponse: context.success ? 'Operation completed successfully' : `Operation failed: ${context.error}`,
            context: [context.toolName, ...Object.keys(context.arguments)],
            tags
        });
    }
    /**
     * Build contextual search queries based on tool and arguments
     */
    buildContextualQueries(toolName, args) {
        const queries = [];
        // Tool-specific queries
        queries.push(toolName);
        if (args.namespace) {
            queries.push(`namespace ${args.namespace}`);
            queries.push(`${toolName} ${args.namespace}`);
        }
        if (args.podName) {
            queries.push(`pod ${args.podName}`);
        }
        // Pattern-based queries for known issues
        if (args.namespace?.includes('student04')) {
            queries.push('student04 build artifacts');
            queries.push('pods succeeded not ready');
            queries.push('ci cd pipeline');
        }
        return queries;
    }
    /**
     * Extract symptoms from tool execution
     */
    extractSymptoms(context) {
        const symptoms = [];
        if (!context.success) {
            symptoms.push(`Tool execution failed: ${context.toolName}`);
            if (context.error) {
                symptoms.push(context.error);
            }
        }
        // Add context-specific symptoms
        if (context.arguments.namespace) {
            symptoms.push(`Operation in namespace: ${context.arguments.namespace}`);
        }
        return symptoms;
    }
    /**
     * Extract affected resources from tool execution
     */
    extractAffectedResources(context) {
        const resources = [];
        if (context.arguments.namespace) {
            resources.push(`namespace:${context.arguments.namespace}`);
        }
        if (context.arguments.podName) {
            resources.push(`pod:${context.arguments.podName}`);
        }
        return resources;
    }
    /**
     * Extract domain from tool name
     */
    extractDomain(toolName) {
        if (toolName.startsWith('oc_diagnostic_'))
            return 'cluster';
        if (toolName.startsWith('oc_read_'))
            return 'openshift';
        if (toolName.startsWith('memory_'))
            return 'knowledge';
        return 'system';
    }
    /**
     * Rank memories by relevance to current context
     */
    rankRelevantMemories(memories, toolName, args) {
        return memories
            .filter(m => m.similarity > 0.3) // Only reasonably similar
            .sort((a, b) => b.similarity - a.similarity) // Highest similarity first
            .slice(0, 5); // Top 5 most relevant
    }
}
