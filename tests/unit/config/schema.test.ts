/**
 * Unit tests for Configuration Schema and Validation
 */

import { 
  ConfigValidator, 
  isValidEnvironment, 
  isValidLogLevel,
  isValidToolMode,
  CONFIG_SCHEMA 
} from '../../../src/lib/config/schema.ts';

describe('Configuration Schema', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe('Environment Validation', () => {
    it('should validate correct environment values', () => {
      expect(isValidEnvironment('development')).toBe(true);
      expect(isValidEnvironment('production')).toBe(true);
      expect(isValidEnvironment('test')).toBe(true);
    });

    it('should reject invalid environment values', () => {
      expect(isValidEnvironment('invalid')).toBe(false);
      expect(isValidEnvironment('')).toBe(false);
    });
  });

  describe('Log Level Validation', () => {
    it('should validate correct log levels', () => {
      expect(isValidLogLevel('error')).toBe(true);
      expect(isValidLogLevel('warn')).toBe(true);
      expect(isValidLogLevel('info')).toBe(true);
      expect(isValidLogLevel('debug')).toBe(true);
    });

    it('should reject invalid log levels', () => {
      expect(isValidLogLevel('verbose')).toBe(false);
      expect(isValidLogLevel('trace')).toBe(false);
      expect(isValidLogLevel('')).toBe(false);
    });
  });

  describe('Tool Mode Validation', () => {
    it('should validate correct tool modes', () => {
      expect(isValidToolMode('strict')).toBe(true);
      expect(isValidToolMode('relaxed')).toBe(true);
      expect(isValidToolMode('auto')).toBe(true);
    });

    it('should reject invalid tool modes', () => {
      expect(isValidToolMode('invalid')).toBe(false);
      expect(isValidToolMode('')).toBe(false);
    });
  });

  describe('Schema Constants', () => {
    it('should have defined schema constants', () => {
      expect(CONFIG_SCHEMA).toBeDefined();
      expect(typeof CONFIG_SCHEMA).toBe('object');
    });
  });
});
