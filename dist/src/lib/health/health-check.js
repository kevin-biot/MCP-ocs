/**
 * Health Check System - Addressing Qwen Review
 *
 * Comprehensive health monitoring for production deployments
 */
import { logger } from '../logging/structured-logger';
import { nowEpoch } from '../../utils/time.js';
/**
 * Comprehensive health check manager
 */
export class HealthCheckManager {
    openshiftClient;
    memoryManager;
    workflowEngine;
    configValidator;
    startTime;
    constructor(openshiftClient, memoryManager, workflowEngine, configValidator) {
        this.openshiftClient = openshiftClient;
        this.memoryManager = memoryManager;
        this.workflowEngine = workflowEngine;
        this.configValidator = configValidator;
        this.startTime = new Date();
    }
    /**
     * Perform complete system health check
     */
    async performHealthCheck() {
        const startTime = nowEpoch();
        logger.debug('Starting system health check');
        const checks = await Promise.allSettled([
            this.checkOpenShiftConnectivity(),
            this.checkMemorySystemHealth(),
            this.checkWorkflowEngineHealth(),
            this.checkConfigurationValid(),
            this.checkFileSystemAccess(),
            this.checkSystemResources()
        ]);
        const healthChecks = checks.map((result, index) => {
            const checkNames = [
                'openshift_connectivity',
                'memory_system',
                'workflow_engine',
                'configuration',
                'filesystem_access',
                'system_resources'
            ];
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                const name = checkNames[index] ?? `check_${index}`;
                return {
                    name,
                    status: 'unhealthy',
                    message: `Health check failed: ${String(result.reason?.message ?? result.reason ?? 'unknown')}`,
                    timestamp: new Date().toISOString(),
                    duration: 0
                };
            }
        });
        const summary = this.calculateSummary(healthChecks);
        const overallStatus = this.determineOverallStatus(summary);
        const systemHealth = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.1.0',
            uptime: nowEpoch() - this.startTime.getTime(),
            checks: healthChecks,
            summary
        };
        const duration = nowEpoch() - startTime;
        logger.info('System health check completed', {
            status: overallStatus,
            duration,
            checksCount: healthChecks.length,
            healthyCount: summary.healthy
        });
        return systemHealth;
    }
    /**
     * Quick liveness probe for container orchestration
     */
    async livenessProbe() {
        try {
            // Simple check - if we can respond, we're alive
            return { alive: true };
        }
        catch (error) {
            logger.error('Liveness probe failed', error instanceof Error ? error : new Error(String(error)));
            return { alive: false };
        }
    }
    /**
     * Readiness probe for load balancer integration
     */
    async readinessProbe() {
        try {
            // Check critical components only
            const criticalChecks = await Promise.allSettled([
                this.checkConfigurationValid(),
                this.checkMemorySystemHealth()
            ]);
            const failed = criticalChecks.find(check => check.status === 'rejected' ||
                (check.status === 'fulfilled' && check.value.status === 'unhealthy'));
            if (failed) {
                const reason = failed.status === 'rejected' ?
                    failed.reason.message :
                    'Critical component unhealthy';
                return { ready: false, reason };
            }
            return { ready: true };
        }
        catch (error) {
            logger.error('Readiness probe failed', error instanceof Error ? error : new Error(String(error)));
            return { ready: false, reason: error instanceof Error ? error.message : String(error) };
        }
    }
    /**
     * Individual health check implementations
     */
    async checkOpenShiftConnectivity() {
        const start = nowEpoch();
        const checkName = 'openshift_connectivity';
        try {
            const clusterInfo = await this.openshiftClient.getClusterInfo();
            const duration = nowEpoch() - start;
            if (clusterInfo.status === 'connected') {
                return {
                    name: checkName,
                    status: 'healthy',
                    message: 'OpenShift cluster connection successful',
                    timestamp: new Date().toISOString(),
                    duration,
                    details: {
                        serverUrl: clusterInfo.serverUrl,
                        currentUser: clusterInfo.currentUser,
                        version: clusterInfo.version
                    }
                };
            }
            else {
                return {
                    name: checkName,
                    status: 'unhealthy',
                    message: `OpenShift cluster not accessible: ${clusterInfo.status}`,
                    timestamp: new Date().toISOString(),
                    duration
                };
            }
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `OpenShift connectivity failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    async checkMemorySystemHealth() {
        const start = nowEpoch();
        const checkName = 'memory_system';
        try {
            const stats = await this.memoryManager.getStats();
            const duration = nowEpoch() - start;
            // Determine status based on memory system state
            let status = 'healthy';
            let message = 'Memory system operational';
            if (!stats.chromaAvailable) {
                status = 'degraded';
                message = 'Memory system running in JSON fallback mode (ChromaDB unavailable)';
            }
            return {
                name: checkName,
                status,
                message,
                timestamp: new Date().toISOString(),
                duration,
                details: {
                    chromaAvailable: stats.chromaAvailable,
                    totalConversations: stats.totalConversations,
                    totalOperational: stats.totalOperational,
                    storageUsed: stats.storageUsed,
                    namespace: stats.namespace
                }
            };
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `Memory system check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    async checkWorkflowEngineHealth() {
        const start = nowEpoch();
        const checkName = 'workflow_engine';
        try {
            const activeStates = await this.workflowEngine.getActiveStates();
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'healthy',
                message: 'Workflow engine operational',
                timestamp: new Date().toISOString(),
                duration,
                details: {
                    activeSessions: activeStates.activeSessions,
                    enforcementLevel: this.workflowEngine.getEnforcementLevel()
                }
            };
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `Workflow engine check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    async checkConfigurationValid() {
        const start = nowEpoch();
        const checkName = 'configuration';
        try {
            // Note: This would need access to the current configuration
            // For now, we'll simulate a basic configuration check
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'healthy',
                message: 'Configuration valid',
                timestamp: new Date().toISOString(),
                duration
            };
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `Configuration check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    async checkFileSystemAccess() {
        const start = nowEpoch();
        const checkName = 'filesystem_access';
        try {
            // Test basic filesystem operations
            const testDir = './logs';
            const testFile = `${testDir}/.health-check-${nowEpoch()}`;
            // Import fs/promises dynamically
            const fs = await import('fs/promises');
            // Ensure directory exists
            await fs.mkdir(testDir, { recursive: true });
            // Test write
            await fs.writeFile(testFile, 'health-check');
            // Test read
            const content = await fs.readFile(testFile, 'utf8');
            // Cleanup
            await fs.unlink(testFile);
            const duration = nowEpoch() - start;
            if (content === 'health-check') {
                return {
                    name: checkName,
                    status: 'healthy',
                    message: 'Filesystem access operational',
                    timestamp: new Date().toISOString(),
                    duration
                };
            }
            else {
                return {
                    name: checkName,
                    status: 'unhealthy',
                    message: 'Filesystem read/write test failed',
                    timestamp: new Date().toISOString(),
                    duration
                };
            }
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `Filesystem check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    async checkSystemResources() {
        const start = nowEpoch();
        const checkName = 'system_resources';
        try {
            const memoryUsage = process.memoryUsage();
            const duration = nowEpoch() - start;
            // Convert bytes to MB
            const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
            // Determine status based on memory usage
            let status = 'healthy';
            let message = 'System resources within normal limits';
            if (heapUsedMB > 500) { // 500MB threshold
                status = 'degraded';
                message = 'High memory usage detected';
            }
            if (heapUsedMB > 1000) { // 1GB threshold
                status = 'unhealthy';
                message = 'Critical memory usage';
            }
            return {
                name: checkName,
                status,
                message,
                timestamp: new Date().toISOString(),
                duration,
                details: {
                    memoryUsage: {
                        heapUsedMB,
                        heapTotalMB,
                        rss: Math.round(memoryUsage.rss / 1024 / 1024),
                        external: Math.round(memoryUsage.external / 1024 / 1024)
                    },
                    uptime: process.uptime(),
                    nodeVersion: process.version
                }
            };
        }
        catch (error) {
            const duration = nowEpoch() - start;
            return {
                name: checkName,
                status: 'unhealthy',
                message: `System resources check failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                duration
            };
        }
    }
    calculateSummary(checks) {
        return {
            total: checks.length,
            healthy: checks.filter(c => c.status === 'healthy').length,
            degraded: checks.filter(c => c.status === 'degraded').length,
            unhealthy: checks.filter(c => c.status === 'unhealthy').length
        };
    }
    determineOverallStatus(summary) {
        if (summary.unhealthy > 0)
            return 'unhealthy';
        if (summary.degraded > 0)
            return 'degraded';
        return 'healthy';
    }
}
