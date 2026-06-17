import { describe, it, expect } from 'vitest';
import { calculateEmissions, sanitizeNumber, EMISSION_FACTORS } from '../src/logic/calculator';

describe('Calculator Logic', () => {
  describe('sanitizeNumber()', () => {
    it('should return valid positive numbers unchanged', () => {
      expect(sanitizeNumber(10)).toBe(10);
      expect(sanitizeNumber('15.5')).toBe(15.5);
    });

    it('should convert invalid/negative numbers to 0', () => {
      expect(sanitizeNumber(-5)).toBe(0);
      expect(sanitizeNumber('abc')).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
      expect(sanitizeNumber(null)).toBe(0);
    });

    it('should cap extremely large numbers at 10000', () => {
      expect(sanitizeNumber(999999)).toBe(10000);
    });
  });

  describe('calculateEmissions()', () => {
    it('should calculate valid inputs correctly', () => {
      const result = calculateEmissions('car', 10, 'average', 5);
      
      const expectedTransport = 10 * EMISSION_FACTORS.transport.car;
      const expectedDiet = EMISSION_FACTORS.diet.average;
      const expectedEnergy = 5 * EMISSION_FACTORS.energy;
      
      expect(result.transport).toBe(Number(expectedTransport.toFixed(2)));
      expect(result.diet).toBe(Number(expectedDiet.toFixed(2)));
      expect(result.energy).toBe(Number(expectedEnergy.toFixed(2)));
      expect(result.total).toBe(Number((expectedTransport + expectedDiet + expectedEnergy).toFixed(2)));
    });

    it('should handle invalid enum inputs by falling back to safe defaults', () => {
      const result = calculateEmissions('spaceship', 10, 'rocks', 5);
      
      // Defaults: transport -> 'car', diet -> 'average'
      const expectedTransport = 10 * EMISSION_FACTORS.transport.car;
      const expectedDiet = EMISSION_FACTORS.diet.average;
      
      expect(result.transport).toBe(Number(expectedTransport.toFixed(2)));
      expect(result.diet).toBe(Number(expectedDiet.toFixed(2)));
    });

    it('should handle negative/invalid numeric inputs gracefully', () => {
      const result = calculateEmissions('ev', -50, 'vegan', 'invalid');
      
      // Distance and Energy should become 0
      expect(result.transport).toBe(0);
      expect(result.energy).toBe(0);
      expect(result.diet).toBe(EMISSION_FACTORS.diet.vegan);
      expect(result.total).toBe(EMISSION_FACTORS.diet.vegan);
    });
  });
});
