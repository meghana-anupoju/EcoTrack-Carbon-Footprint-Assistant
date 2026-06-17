import { describe, it, expect } from 'vitest';
import { generateInsights } from '../src/logic/insights';

describe('Insights Logic', () => {
  it('should return a default message if no data is present', () => {
    const insights = generateInsights(null);
    expect(insights).toContain("Start logging activities to receive personalized recommendations.");
  });

  it('should generate high transport warnings', () => {
    const data = { transport: 6, diet: 0, energy: 0, total: 6 };
    const insights = generateInsights(data);
    expect(insights.some(msg => msg.includes('transport emissions are high'))).toBe(true);
  });

  it('should praise low plant-based diet emissions', () => {
    const data = { transport: 0, diet: 1.5, energy: 0, total: 1.5 };
    const insights = generateInsights(data);
    expect(insights.some(msg => msg.includes('plant-based diet is a major contributor'))).toBe(true);
  });

  it('should compare with historical data and praise improvement', () => {
    const current = { transport: 1, diet: 1.5, energy: 1, total: 3.5 };
    const history = [
      { total: 5.0 }, // older record
      { total: 4.5 }, // previous record
      current         // current isn't technically in history parameter array when called before saving, but we pass history as the array of past records
    ];
    // In our implementation, `history` includes the current record if saved first, or we pass it specifically.
    // Wait, let's verify logic: `generateInsights` checks `history[history.length - 2]` against `currentData.total`.
    // If we pass an array of length 2, `history.length > 1` is true.
    const mockHistory = [
      { total: 5.0 },
      { total: 3.5 } // Assuming the current record was already pushed to history
    ];
    
    const insights = generateInsights(current, mockHistory);
    expect(insights.some(msg => msg.includes('Awesome! You reduced your total footprint'))).toBe(true);
  });

  it('should provide multiple insights for a high overall footprint', () => {
    const data = { transport: 10, diet: 3.3, energy: 8, total: 21.3 };
    const insights = generateInsights(data, []);
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights.some(msg => msg.includes('carpooling'))).toBe(true);
    expect(insights.some(msg => msg.includes('Meat-heavy'))).toBe(true);
    expect(insights.some(msg => msg.includes('LED bulbs'))).toBe(true);
  });
});
