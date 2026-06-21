import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, saveToHistory, getLatestRecord, clearHistory } from '../src/utils/storage';

describe('Storage Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return an empty array if storage is empty', () => {
    expect(getHistory()).toEqual([]);
  });

  it('should return parsed history if storage has data', () => {
    const mockData = [{ total: 5 }];
    localStorage.setItem('ecotrack_history', JSON.stringify(mockData));
    expect(getHistory()).toEqual(mockData);
  });

  it('should return empty array and not throw if JSON is invalid', () => {
    localStorage.setItem('ecotrack_history', 'invalid-json');
    expect(getHistory()).toEqual([]);
  });

  it('should save to history and keep max 30 records', () => {
    for (let i = 0; i < 35; i++) {
      saveToHistory({ total: i });
    }
    const history = getHistory();
    expect(history.length).toBe(30);
    // The first 5 should be shifted out, so the first element should have total: 5
    expect(history[0].total).toBe(5);
  });

  it('should fail silently if localStorage setItem throws an error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    // This should not throw an error
    expect(() => saveToHistory({ total: 10 })).not.toThrow();
  });

  it('should get latest record', () => {
    saveToHistory({ total: 10 });
    saveToHistory({ total: 20 });
    expect(getLatestRecord().total).toBe(20);
  });

  it('should return null if no latest record', () => {
    expect(getLatestRecord()).toBeNull();
  });

  it('should clear history', () => {
    saveToHistory({ total: 10 });
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it('should fail silently on clearHistory error', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    expect(() => clearHistory()).not.toThrow();
  });
});
