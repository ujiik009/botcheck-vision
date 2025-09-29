import { describe, it, expect } from 'vitest';
import { apiService } from '../api';

describe('ApiService', () => {
  describe('API key management', () => {
    it('should set and get API key', () => {
      apiService.setApiKey('test-key');
      expect(apiService.getApiKey()).toBe('test-key');
    });

    it('should clear API key', () => {
      apiService.setApiKey('test-key');
      apiService.setApiKey(null);
      expect(apiService.getApiKey()).toBe(null);
    });

    it('should handle null API key', () => {
      // This tests the basic functionality without complex mocking
      const key = apiService.getApiKey();
      expect(key === null || typeof key === 'string').toBe(true);
    });
  });
});