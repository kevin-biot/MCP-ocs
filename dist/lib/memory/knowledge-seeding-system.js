/**
 * Knowledge Seeding System v0.3.1
 * Allows engineers to formally add internet knowledge with proper classification
 * Builds on Auto-Memory System v0.3.0 and Qwen's framework design
 */
// Source class definitions from Qwen's framework
export var KnowledgeSourceClass;
(function (KnowledgeSourceClass) {
    // Engineered content (manually added by engineers)
    KnowledgeSourceClass["ENGINEER_ADDED"] = "engineer_added";
    // Internet/community knowledge (seeded from external sources)
    KnowledgeSourceClass["INTERNET_KNOWLEDGE"] = "internet_knowledge";
    // Official documentation (OpenShift, Kubernetes, etc.)
    KnowledgeSourceClass["OFFICIAL_DOCUMENTATION"] = "official_documentation";
    // Community best practices and examples
    KnowledgeSourceClass["COMMUNITY_BEST_PRACTICES"] = "community_best_practices";
    // Internal operational knowledge (from incidents, etc.)
    KnowledgeSourceClass["INTERNAL_OPERATIONAL"] = "internal_operational";
    // Tool execution memories (automatically captured)
    KnowledgeSourceClass["TOOL_EXECUTION"] = "tool_execution";
    // System-generated insights
    KnowledgeSourceClass["SYSTEM_INSIGHTS"] = "system_insights";
})(KnowledgeSourceClass || (KnowledgeSourceClass = {}));
// Quick engineer templates for common use cases
export const ENGINEER_TEMPLATES = {
    PATTERN_DISCOVERY: (title, pattern, context) => ({
        title: `Pattern: ${title}`,
        sourceClass: KnowledgeSourceClass.ENGINEER_ADDED,
        content: `**Pattern Identified:** ${pattern}\n\n**Context:** ${context}\n\n**Engineer Notes:** Add specific observations here`,
        tags: ["pattern_discovery", "engineer_insight"],
        metadata: {
            author: "Field Engineer",
            creationDate: new Date().toISOString(),
            reliabilityScore: 90
        }
    }),
    TROUBLESHOOTING_SEQUENCE: (issue, steps, outcome) => ({
        title: `Troubleshooting: ${issue}`,
        sourceClass: KnowledgeSourceClass.INTERNAL_OPERATIONAL,
        content: `**Issue:** ${issue}\n\n**Steps Taken:**\n${steps}\n\n**Outcome:** ${outcome}`,
        tags: ["troubleshooting", "step_by_step", "operational"],
        metadata: {
            author: "Field Engineer",
            creationDate: new Date().toISOString(),
            reliabilityScore: 95
        }
    }),
    FALSE_POSITIVE: (scenario, explanation) => ({
        title: `False Positive: ${scenario}`,
        sourceClass: KnowledgeSourceClass.ENGINEER_ADDED,
        content: `**Scenario:** ${scenario}\n\n**Why It's a False Positive:** ${explanation}\n\n**Action:** No intervention needed`,
        tags: ["false_positive", "no_action_needed", "engineer_insight"],
        metadata: {
            author: "Field Engineer",
            creationDate: new Date().toISOString(),
            reliabilityScore: 88
        }
    }),
    INTERNET_KNOWLEDGE: (title, source, content, url) => ({
        title: `Internet Knowledge: ${title}`,
        sourceClass: KnowledgeSourceClass.INTERNET_KNOWLEDGE,
        content: `**Source:** ${source}\n\n**Knowledge:**\n${content}`,
        tags: ["internet_knowledge", "external_source"],
        metadata: {
            author: "Community/Internet",
            creationDate: new Date().toISOString(),
            reliabilityScore: 75,
            referenceUrls: url ? [url] : []
        }
    })
};
export class KnowledgeSeedingSystem {
    memoryManager;
    autoMemorySystem;
    constructor(memoryManager, autoMemorySystem) {
        this.memoryManager = memoryManager;
        this.autoMemorySystem = autoMemorySystem;
    }
    /**
     * Seed knowledge into the vector memory system with proper classification
     */
    async seedKnowledge(seed) {
        const memoryId = `knowledge_${seed.sourceClass}_${Date.now()}`;
        // Generate comprehensive tags including source class
        const allTags = [
            `source:${seed.sourceClass}`,
            ...seed.tags,
            "knowledge_seed",
            "vector_memory",
            "seeded_knowledge"
        ];
        // Add cluster/namespace tags if provided
        if (seed.metadata.cluster) {
            allTags.push(`cluster:${seed.metadata.cluster}`);
        }
        if (seed.metadata.namespace) {
            allTags.push(`namespace:${seed.metadata.namespace}`);
        }
        // Create enhanced memory record
        const enhancedRecord = {
            id: memoryId,
            sourceClass: seed.sourceClass,
            content: seed.content,
            tags: allTags,
            context: {
                title: seed.title,
                seedType: "manual_knowledge_seeding",
                engineerAdded: seed.sourceClass === KnowledgeSourceClass.ENGINEER_ADDED
            },
            metadata: {
                sourceType: seed.sourceClass,
                author: seed.metadata.author,
                creationDate: seed.metadata.creationDate || new Date().toISOString(),
                reliability: seed.metadata.reliabilityScore || 70,
                references: seed.metadata.referenceUrls || [],
                cluster: seed.metadata.cluster,
                namespace: seed.metadata.namespace
            }
        };
        // Store in conversation memory for persistence
        await this.memoryManager.storeConversation({
            sessionId: memoryId,
            domain: 'knowledge-seeding',
            timestamp: Date.now(),
            userMessage: `Knowledge Seed: ${seed.title}`,
            assistantResponse: JSON.stringify(enhancedRecord),
            context: [`Knowledge seeded by ${seed.metadata.author}`, `Source: ${seed.sourceClass}`],
            tags: allTags
        });
        return memoryId;
    }
    /**
     * Search knowledge with advanced filtering capabilities
     */
    async searchKnowledge(query, options = {}) {
        // Build search query with filters
        let searchQuery = query;
        // Add source class filters
        if (options.sourceClasses && options.sourceClasses.length > 0) {
            const sourceFilters = options.sourceClasses.map(sc => `source:${sc}`).join(' OR ');
            searchQuery += ` (${sourceFilters})`;
        }
        // Add tag filters
        if (options.tags && options.tags.length > 0) {
            searchQuery += ` ${options.tags.join(' ')}`;
        }
        // Add cluster/namespace filters
        if (options.cluster) {
            searchQuery += ` cluster:${options.cluster}`;
        }
        if (options.namespace) {
            searchQuery += ` namespace:${options.namespace}`;
        }
        // Search using the memory manager
        const results = await this.memoryManager.searchConversations(searchQuery, options.limit || 10);
        // Filter by reliability threshold if specified
        if (options.reliabilityThreshold !== undefined) {
            return results.filter((result) => {
                try {
                    const record = JSON.parse(result.assistantResponse);
                    return record.metadata?.reliability >= options.reliabilityThreshold;
                }
                catch {
                    return true; // Keep if we can't parse
                }
            });
        }
        return results;
    }
    /**
     * Quick knowledge seeding using predefined templates
     */
    async quickSeed(templateType, ...args) {
        const template = ENGINEER_TEMPLATES[templateType](...args);
        return this.seedKnowledge(template);
    }
    /**
     * Get knowledge statistics by source class
     */
    async getKnowledgeStats() {
        const stats = {};
        // Initialize all source classes to 0
        Object.values(KnowledgeSourceClass).forEach(sourceClass => {
            stats[sourceClass] = 0;
        });
        // Search for each source class and count
        for (const sourceClass of Object.values(KnowledgeSourceClass)) {
            const results = await this.searchKnowledge("", {
                sourceClasses: [sourceClass],
                limit: 1000 // Get all
            });
            stats[sourceClass] = results.length;
        }
        return stats;
    }
    /**
     * Link knowledge to tool execution memories
     */
    async linkToToolExecution(knowledgeId, toolExecutionSessionId) {
        // This would update the knowledge record to reference the tool execution
        // Implementation depends on how we want to handle cross-references
        console.log(`Linking knowledge ${knowledgeId} to tool execution ${toolExecutionSessionId}`);
    }
    /**
     * Suggest relevant knowledge before tool execution
     */
    async suggestRelevantKnowledge(toolName, args) {
        // Build context query from tool name and arguments
        let query = toolName;
        // Extract namespace if present in arguments
        if (args.namespace) {
            query += ` namespace:${args.namespace}`;
        }
        // Extract resource type
        if (args.resourceType) {
            query += ` ${args.resourceType}`;
        }
        // Search for relevant knowledge
        return this.searchKnowledge(query, {
            limit: 5,
            reliabilityThreshold: 70
        });
    }
}
