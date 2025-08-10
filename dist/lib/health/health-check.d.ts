/**
 * Health Check System - Addressing Qwen Review
 *
 * Comprehensive health monitoring for production deployments
 */
import { OpenShiftClient } from '../openshift-client.js';
import { SharedMemoryManager } from '../memory/shared-memory.js';
import { WorkflowEngine } from '../workflow/workflow-engine.js';
import { ConfigValidator } from '../config/schema.js';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export interface HealthCheck {
    name: string;
    status: HealthStatus;
    message: string;
    timestamp: string;
    duration: number;
    details?: Record<string, any>;
}
export interface SystemHealth {
    status: HealthStatus;
    timestamp: string;
    version: string;
    uptime: number;
    checks: HealthCheck[];
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
    };
}
/**
 * Comprehensive health check manager
 */
export declare class HealthCheckManager {
    private openshiftClient;
    private memoryManager;
    private workflowEngine;
    private configValidator;
    private startTime;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager, workflowEngine: WorkflowEngine, configValidator: ConfigValidator);
    /**
     * Perform complete system health check
     */
    performHealthCheck(): Promise<SystemHealth>;
    /**
     * Quick liveness probe for container orchestration
     */
    livenessProbe(): Promise<{
        alive: boolean;
    }>;
    /**
     * Readiness probe for load balancer integration
     */
    readinessProbe(): Promise<{
        ready: boolean;
        reason?: string;
    }>;
    /**
     * Individual health check implementations
     */
    private checkOpenShiftConnectivity;
    private checkMemorySystemHealth;
    private checkWorkflowEngineHealth;
    private checkConfigurationValid;
    private checkFileSystemAccess;
    private checkSystemResources;
    private calculateSummary;
    private determineOverallStatus;
}
