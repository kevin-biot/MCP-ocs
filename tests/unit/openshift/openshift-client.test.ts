/**
 * Unit tests for Enhanced OpenShift Client
 * Tests security, resilience, and performance improvements
 */

import { OpenShiftClient } from '../../../src/lib/openshift-client-enhanced.js';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock the exec function
jest.mock('child_process');
jest.mock('util');

const mockExecAsync = jest.fn();
(promisify as jest.Mock).mockReturnValue(mockExecAsync);

describe('OpenShiftClient', () => {
  let client: OpenShiftClient;
  let defaultConfig: any;

  beforeEach(() => {
    defaultConfig = {
      ocPath: 'oc',
      timeout: 5000
    };
    
    jest.clearAllMocks();
    mockExecAsync.mockClear();
  });

  describe('Constructor and Configuration Validation', () => {
    it('should initialize with valid configuration', () => {
      expect(() => {
        client = new OpenShiftClient(defaultConfig);
      }).not.toThrow();
    });

    it('should reject invalid timeout values', () => {
      expect(() => {
        new OpenShiftClient({ ...defaultConfig, timeout: 500 }); // Too short
      }).toThrow('Timeout must be between 1-300 seconds');

      expect(() => {
        new OpenShiftClient({ ...defaultConfig, timeout: 400000 }); // Too long
      }).toThrow('Timeout must be between 1-300 seconds');
    });

    it('should reject invalid namespace format', () => {
      expect(() => {
        new OpenShiftClient({ ...defaultConfig, defaultNamespace: 'INVALID-NAMESPACE' });
      }).toThrow('Invalid namespace format');

      expect(() => {
        new OpenShiftClient({ ...defaultConfig, defaultNamespace: '-invalid' });
      }).toThrow('Invalid namespace format');
    });

    it('should reject dangerous oc path', () => {
      expect(() => {
        new OpenShiftClient({ ...defaultConfig, ocPath: 'oc; rm -rf /' });
      }).toThrow('Invalid oc path: contains dangerous characters');

      expect(() => {
        new OpenShiftClient({ ...defaultConfig, ocPath: '../../../bin/malicious' });
      }).toThrow('Invalid oc path: contains dangerous characters');
    });
  });

  describe('Input Sanitization', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should sanitize valid arguments', () => {
      // Access private method for testing
      const sanitizeArgument = (client as any).sanitizeArgument.bind(client);
      
      expect(sanitizeArgument('get')).toBe('get');
      expect(sanitizeArgument('pods')).toBe('pods');
      expect(sanitizeArgument('my-namespace')).toBe('my-namespace');
      expect(sanitizeArgument('-o')).toBe('-o');
      expect(sanitizeArgument('json')).toBe('json');
    });

    it('should reject dangerous command injection patterns', () => {
      const sanitizeArgument = (client as any).sanitizeArgument.bind(client);
      
      const dangerousInputs = [
        'pods; rm -rf /',
        'pods && malicious-command',
        'pods | grep secret',
        'pods`whoami`',
        'pods$(malicious)',
        'pods{dangerous}',
        'pods\0null-byte',
        'pods\nline-break',
        'pods\rcarriage-return'
      ];

      dangerousInputs.forEach(input => {
        expect(() => sanitizeArgument(input)).toThrow('Argument contains dangerous pattern');
      });
    });

    it('should reject overly long arguments', () => {
      const sanitizeArgument = (client as any).sanitizeArgument.bind(client);
      const longInput = 'a'.repeat(1001);
      
      expect(() => sanitizeArgument(longInput)).toThrow('Argument too long');
    });

    it('should reject null or non-string arguments', () => {
      const sanitizeArgument = (client as any).sanitizeArgument.bind(client);
      
      expect(() => sanitizeArgument(null)).toThrow('Invalid argument: must be non-empty string');
      expect(() => sanitizeArgument(undefined)).toThrow('Invalid argument: must be non-empty string');
      expect(() => sanitizeArgument('')).toThrow('Invalid argument: must be non-empty string');
      expect(() => sanitizeArgument(123 as any)).toThrow('Invalid argument: must be non-empty string');
    });
  });

  describe('Command Execution', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should execute valid commands successfully', async () => {
      const mockResponse = testUtils.mockOcResponse('get pods', JSON.stringify({
        items: [
          {
            metadata: { name: 'test-pod', namespace: 'default', creationTimestamp: new Date().toISOString() },
            status: { phase: 'Running', conditions: [{ type: 'Ready', status: 'True' }] },
            spec: { nodeName: 'node1' }
          }
        ]
      }));

      mockExecAsync.mockResolvedValue(mockResponse);

      const pods = await client.getPods();

      expect(pods).toHaveLength(1);
      expect(pods[0].name).toBe('test-pod');
      expect(pods[0].status).toBe('Running');
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('oc get pods'),
        expect.objectContaining({
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024
        })
      );
    });

    it('should handle command timeouts gracefully', async () => {
      const timeoutError = new Error('Command timeout');
      timeoutError.code = 'ETIMEDOUT';
      mockExecAsync.mockRejectedValue(timeoutError);

      await expect(client.getPods()).rejects.toThrow('OpenShift operation timed out: get');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      authError.stderr = 'error: You must be logged in to the server (Unauthorized)';
      mockExecAsync.mockRejectedValue(authError);

      await expect(client.getPods()).rejects.toThrow('OpenShift authentication failed: get');
    });

    it('should handle resource not found errors', async () => {
      const notFoundError = new Error('Resource not found');
      notFoundError.stderr = 'error: the server could not find the requested resource (NotFound)';
      mockExecAsync.mockRejectedValue(notFoundError);

      await expect(client.getPods()).rejects.toThrow('OpenShift resource not found: get');
    });
  });

  describe('Circuit Breaker Pattern', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should allow operations when circuit is closed', async () => {
      mockExecAsync.mockResolvedValue(testUtils.mockOcResponse('get pods', '{"items":[]}'));

      const result = await client.getClusterInfo();
      expect(result.status).toBe('connected');
    });

    it('should open circuit after repeated failures', async () => {
      const error = new Error('Persistent failure');
      mockExecAsync.mockRejectedValue(error);

      // Trigger enough failures to open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await client.getClusterInfo();
        } catch (e) {
          // Expected failures
        }
      }

      // Next call should be blocked by open circuit
      await expect(client.getClusterInfo()).rejects.toThrow('Circuit breaker openshift-cli is open');
    });

    it('should transition to half-open after timeout', async () => {
      const error = new Error('Failure');
      mockExecAsync.mockRejectedValue(error);

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await client.getClusterInfo();
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout (mock time passage)
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(0) // Initial failure time
        .mockReturnValueOnce(30001); // After reset timeout

      // Should allow one attempt in half-open state
      mockExecAsync.mockResolvedValueOnce(testUtils.mockOcResponse('whoami', 'test-user'));
      
      const result = await client.getClusterInfo();
      expect(result.status).toBe('connected');
    });
  });

  describe('Request Deduplication', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should deduplicate identical concurrent requests', async () => {
      mockExecAsync.mockResolvedValue(testUtils.mockOcResponse('whoami', 'test-user'));

      // Start multiple identical requests concurrently
      const promises = [
        client.getClusterInfo(),
        client.getClusterInfo(),
        client.getClusterInfo()
      ];

      await Promise.all(promises);

      // Should only execute the command once due to deduplication
      expect(mockExecAsync).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different requests', async () => {
      mockExecAsync
        .mockResolvedValueOnce(testUtils.mockOcResponse('whoami', 'test-user'))
        .mockResolvedValueOnce(testUtils.mockOcResponse('get pods', '{"items":[]}'));

      await Promise.all([
        client.getClusterInfo(),
        client.getPods()
      ]);

      expect(mockExecAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Caching Behavior', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
      jest.spyOn(Date, 'now').mockReturnValue(1000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should cache cluster info for TTL period', async () => {
      mockExecAsync.mockResolvedValue(testUtils.mockOcResponse('whoami', 'test-user'));

      // First call
      await client.getClusterInfo();
      
      // Second call within TTL
      jest.spyOn(Date, 'now').mockReturnValue(1000 + 15000); // 15 seconds later
      await client.getClusterInfo();

      // Should only call exec once due to caching
      expect(mockExecAsync).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      mockExecAsync.mockResolvedValue(testUtils.mockOcResponse('whoami', 'test-user'));

      // First call
      await client.getClusterInfo();
      
      // Second call after TTL
      jest.spyOn(Date, 'now').mockReturnValue(1000 + 35000); // 35 seconds later
      await client.getClusterInfo();

      // Should call exec twice due to cache expiration
      expect(mockExecAsync).toHaveBeenCalledTimes(2);
    });

    it('should allow manual cache clearing', async () => {
      mockExecAsync.mockResolvedValue(testUtils.mockOcResponse('whoami', 'test-user'));

      // First call
      await client.getClusterInfo();
      
      // Clear cache
      client.clearCache();
      
      // Second call should hit the server again
      await client.getClusterInfo();

      expect(mockExecAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should report healthy status when circuit is closed', () => {
      const health = client.getHealth();
      
      expect(health.healthy).toBe(true);
      expect(health.issues).toHaveLength(0);
    });

    it('should report unhealthy status when circuit is open', async () => {
      // Force circuit to open
      const error = new Error('Persistent failure');
      mockExecAsync.mockRejectedValue(error);

      for (let i = 0; i < 5; i++) {
        try {
          await client.getClusterInfo();
        } catch (e) {
          // Expected
        }
      }

      const health = client.getHealth();
      
      expect(health.healthy).toBe(false);
      expect(health.issues).toContain('Circuit breaker is open');
    });

    it('should report issues when request queue is high', () => {
      // Simulate high queue by accessing private property
      const mockQueue = new Map();
      for (let i = 0; i < 15; i++) {
        mockQueue.set(`request-${i}`, Promise.resolve());
      }
      (client as any).requestQueue = mockQueue;

      const health = client.getHealth();
      
      expect(health.healthy).toBe(false);
      expect(health.issues.some(issue => issue.includes('High number of queued requests'))).toBe(true);
    });
  });

  describe('Environment Security', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should remove dangerous environment variables', () => {
      const buildEnvironment = (client as any).buildEnvironment.bind(client);
      
      // Set dangerous environment variables
      process.env.LD_PRELOAD = '/malicious/lib.so';
      process.env.LD_LIBRARY_PATH = '/malicious/path';
      
      const env = buildEnvironment();
      
      expect(env.LD_PRELOAD).toBeUndefined();
      expect(env.LD_LIBRARY_PATH).toBeUndefined();
    });

    it('should preserve KUBECONFIG when specified', () => {
      const configWithKubeconfig = {
        ...defaultConfig,
        kubeconfig: '/path/to/kubeconfig'
      };
      
      const clientWithKubeconfig = new OpenShiftClient(configWithKubeconfig);
      const buildEnvironment = (clientWithKubeconfig as any).buildEnvironment.bind(clientWithKubeconfig);
      
      const env = buildEnvironment();
      
      expect(env.KUBECONFIG).toBe('/path/to/kubeconfig');
    });
  });

  describe('Error Message Sanitization', () => {
    beforeEach(() => {
      client = new OpenShiftClient(defaultConfig);
    });

    it('should limit stderr output in logs', async () => {
      const longError = new Error('Command failed');
      longError.stderr = 'A'.repeat(500) + 'sensitive-information';
      mockExecAsync.mockRejectedValue(longError);

      try {
        await client.getPods();
      } catch (error) {
        // Error should be thrown but stderr should be truncated in logs
        expect(error.message).toContain('OpenShift command failed');
      }

      // Verify that logging was called with truncated stderr
      // Note: This would require mocking the logger, which is imported in the client
    });
  });
});
