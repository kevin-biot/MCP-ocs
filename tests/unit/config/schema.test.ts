/**
 * Unit tests for Configuration Schema and Validation
 * Tests centralized configuration with validation rules
 */

import { 
  ConfigValidator, 
  isValidEnvironment, 
  isValidLogLevel,
  isValidToolMode,
  CONFIG_SCHEMA 
} from '../../../src/lib/config/schema.js';

describe('Configuration Schema', () => {
  describe('Type Guards', () => {
    describe('isValidEnvironment', () => {
      it('should accept valid environments', () => {
        expect(isValidEnvironment('dev')).toBe(true);
        expect(isValidEnvironment('test')).toBe(true);
        expect(isValidEnvironment('staging')).toBe(true);
        expect(isValidEnvironment('prod')).toBe(true);
      });

      it('should reject invalid environments', () => {
        expect(isValidEnvironment('development')).toBe(false);
        expect(isValidEnvironment('production')).toBe(false);
        expect(isValidEnvironment('local')).toBe(false);
        expect(isValidEnvironment('')).toBe(false);
      });
    });

    describe('isValidLogLevel', () => {
      it('should accept valid log levels', () => {
        expect(isValidLogLevel('debug')).toBe(true);
        expect(isValidLogLevel('info')).toBe(true);
        expect(isValidLogLevel('warn')).toBe(true);
        expect(isValidLogLevel('error')).toBe(true);
      });

      it('should reject invalid log levels', () => {
        expect(isValidLogLevel('verbose')).toBe(false);
        expect(isValidLogLevel('fatal')).toBe(false);
        expect(isValidLogLevel('trace')).toBe(false);
        expect(isValidLogLevel('')).toBe(false);
      });
    });

    describe('isValidToolMode', () => {
      it('should accept valid tool modes', () => {
        expect(isValidToolMode('single')).toBe(true);
        expect(isValidToolMode('team')).toBe(true);
        expect(isValidToolMode('router')).toBe(true);
      });

      it('should reject invalid tool modes', () => {
        expect(isValidToolMode('multi')).toBe(false);
        expect(isValidToolMode('standalone')).toBe(false);
        expect(isValidToolMode('')).toBe(false);
      });
    });
  });

  describe('Configuration Schema Defaults', () => {
    it('should have proper memory defaults', () => {
      expect(CONFIG_SCHEMA.memory.namespace.default).toBe('mcp-ocs');
      expect(CONFIG_SCHEMA.memory.chromaHost.default).toBe('127.0.0.1');
      expect(CONFIG_SCHEMA.memory.chromaPort.default).toBe(8000);
      expect(CONFIG_SCHEMA.memory.jsonDir.default).toBe('./logs/memory');
    });

    it('should have proper OpenShift defaults', () => {
      expect(CONFIG_SCHEMA.openshift.ocPath.default).toBe('oc');
      expect(CONFIG_SCHEMA.openshift.timeout.default).toBe(30000);
    });

    it('should have proper workflow defaults', () => {
      expect(CONFIG_SCHEMA.workflow.panicDetection.default).toBe(true);
      expect(CONFIG_SCHEMA.workflow.enforcement.default).toBe('guidance');
      expect(CONFIG_SCHEMA.workflow.minEvidence.default).toBe(2);
    });
  });
});

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe('validateConfiguration', () => {
    it('should validate a complete valid configuration', async () => {
      const validConfig = testUtils.createTestConfig();
      
      // Mock successful validations
      jest.spyOn(validator as any, 'validateOpenShiftCli').mockResolvedValue(undefined);
      jest.spyOn(validator as any, 'validateMemoryDirectory').mockResolvedValue(undefined);
      jest.spyOn(validator as any, 'validateChromaDB').mockResolvedValue(undefined);

      const result = await validator.validateConfiguration(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid configuration', async () => {
      const invalidConfig = {
        memory: {
          namespace: 'INVALID-NAMESPACE', // Should be lowercase
          chromaPort: 70000, // Invalid port
          jsonDir: '../../../etc/passwd' // Path traversal attempt
        },
        workflow: {
          minEvidence: 15 // Too high
        }
      };

      // Mock validation failures
      jest.spyOn(validator as any, 'validateOpenShiftCli').mockRejectedValue(new Error('oc not found'));

      const result = await validator.validateConfiguration(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('INVALID-NAMESPACE'))).toBe(true);
    });

    it('should handle ChromaDB connectivity warnings', async () => {
      const config = testUtils.createTestConfig();
      
      // Mock successful validations except ChromaDB
      jest.spyOn(validator as any, 'validateOpenShiftCli').mockResolvedValue(undefined);
      jest.spyOn(validator as any, 'validateMemoryDirectory').mockResolvedValue(undefined);
      jest.spyOn(validator as any, 'validateChromaDB').mockImplementation((_, warnings) => {
        warnings.push('ChromaDB not reachable - will use JSON fallback');
        return Promise.resolve();
      });

      const result = await validator.validateConfiguration(config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('ChromaDB not reachable - will use JSON fallback');
    });
  });

  describe('validateField', () => {
    it('should accept valid field values', () => {
      const errors: string[] = [];
      const validator = new ConfigValidator();
      
      // Access private method for testing
      (validator as any).validateField('test.field', 'info', CONFIG_SCHEMA.logLevel, errors);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid field values', () => {
      const errors: string[] = [];
      const validator = new ConfigValidator();
      
      // Access private method for testing
      (validator as any).validateField('test.field', 'invalid', CONFIG_SCHEMA.logLevel, errors);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Log level must be debug, info, warn, or error');
    });

    it('should handle missing required fields', () => {
      const errors: string[] = [];
      const validator = new ConfigValidator();
      
      // Test with required field
      const requiredRule = { ...CONFIG_SCHEMA.memory.namespace, required: true };
      (validator as any).validateField('test.field', undefined, requiredRule, errors);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Required field missing');
    });
  });
});

describe('Configuration Security', () => {
  it('should prevent path traversal in jsonDir', () => {
    const dangerousPaths = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      '/etc/shadow',
      '../../sensitive-file'
    ];

    dangerousPaths.forEach(path => {
      const rule = CONFIG_SCHEMA.memory.jsonDir;
      expect(rule.validator!(path)).toBe(false);
    });
  });

  it('should accept safe relative paths', () => {
    const safePaths = [
      './logs/memory',
      'data/memory',
      'memory-storage',
      'logs/app/memory'
    ];

    safePaths.forEach(path => {
      const rule = CONFIG_SCHEMA.memory.jsonDir;
      expect(rule.validator!(path)).toBe(true);
    });
  });

  it('should validate namespace format', () => {
    const rule = CONFIG_SCHEMA.memory.namespace;
    
    // Valid namespaces
    expect(rule.validator!('mcp-ocs')).toBe(true);
    expect(rule.validator!('test-123')).toBe(true);
    expect(rule.validator!('a')).toBe(true);
    
    // Invalid namespaces
    expect(rule.validator!('MCP-OCS')).toBe(false); // Uppercase
    expect(rule.validator!('-invalid')).toBe(false); // Leading hyphen
    expect(rule.validator!('invalid-')).toBe(false); // Trailing hyphen
    expect(rule.validator!('inv@lid')).toBe(false); // Special characters
  });

  it('should validate port ranges', () => {
    const rule = CONFIG_SCHEMA.memory.chromaPort;
    
    // Valid ports
    expect(rule.validator!(8000)).toBe(true);
    expect(rule.validator!(3000)).toBe(true);
    expect(rule.validator!(65535)).toBe(true);
    
    // Invalid ports
    expect(rule.validator!(0)).toBe(false);
    expect(rule.validator!(-1)).toBe(false);
    expect(rule.validator!(65536)).toBe(false);
    expect(rule.validator!(99999)).toBe(false);
  });

  it('should validate timeout ranges', () => {
    const rule = CONFIG_SCHEMA.openshift.timeout;
    
    // Valid timeouts
    expect(rule.validator!(5000)).toBe(true);
    expect(rule.validator!(30000)).toBe(true);
    expect(rule.validator!(60000)).toBe(true);
    
    // Invalid timeouts
    expect(rule.validator!(500)).toBe(false); // Too short
    expect(rule.validator!(400000)).toBe(false); // Too long
    expect(rule.validator!(-1000)).toBe(false); // Negative
  });

  it('should validate evidence requirements', () => {
    const rule = CONFIG_SCHEMA.workflow.minEvidence;
    
    // Valid evidence counts
    expect(rule.validator!(1)).toBe(true);
    expect(rule.validator!(5)).toBe(true);
    expect(rule.validator!(10)).toBe(true);
    
    // Invalid evidence counts
    expect(rule.validator!(0)).toBe(false); // Too low
    expect(rule.validator!(15)).toBe(false); // Too high
    expect(rule.validator!(-1)).toBe(false); // Negative
  });
});
