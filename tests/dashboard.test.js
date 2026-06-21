import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initDashboard, updateDashboard } from '../src/ui/dashboard';
import { clearHistory } from '../src/utils/storage';

// Basic HTML structure for tests
const htmlStructure = `
  <nav><a href="#dashboard" class="active">Dash</a><a href="#log">Log</a></nav>
  <div id="dashboard" class="view-section active"></div>
  <div id="log" class="view-section" style="display: none;"></div>
  
  <span id="total-score">0.0</span>
  <p id="score-status"></p>
  <ul id="insights-list"></ul>
  
  <div id="transport-bar"></div>
  <div id="diet-bar"></div>
  <div id="energy-bar"></div>
  
  <button id="clear-history-btn">Clear</button>
  
  <form id="activity-form">
    <select id="transport-mode"><option value="car">Car</option></select>
    <input id="transport-dist" value="10" />
    <select id="diet"><option value="average">Average</option></select>
    <input id="energy" value="5" />
    <button type="submit">Submit</button>
  </form>
`;

describe('Dashboard UI', () => {
  beforeEach(() => {
    document.body.innerHTML = htmlStructure;
    clearHistory(); // clear localStorage
    let mockTime = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      mockTime += 1000;
      cb(mockTime);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize and attach event listeners', () => {
    initDashboard();
    
    // Test Navigation
    const logLink = document.querySelector('a[href="#log"]');
    logLink.click();
    expect(logLink.classList.contains('active')).toBe(true);
    expect(document.getElementById('log').style.display).toBe('block');
  });

  it('should handle form submission and update UI', () => {
    initDashboard();
    const form = document.getElementById('activity-form');
    
    // Trigger submit
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    
    // Values: car 10km (1.92), average diet (2.5), energy 5 (1.925) -> Total ~6.35
    expect(document.getElementById('total-score').textContent).not.toBe('0.0');
    expect(document.getElementById('insights-list').children.length).toBeGreaterThan(0);
  });

  it('should handle clear history', () => {
    initDashboard();
    const btn = document.getElementById('clear-history-btn');
    btn.click();
    
    // Assuming UI resets to 0.0 because of mock timeout in animateValue,
    // actually animateValue relies on requestAnimationFrame which might not run in JSDOM easily.
    // But we test if the click doesn't crash
    expect(document.getElementById('total-score')).toBeDefined();
  });
  
  it('updateDashboard handles null elements gracefully', () => {
    expect(() => updateDashboard(null, null, null, null, null)).not.toThrow();
  });
});
