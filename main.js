import './style.css';
import { calculateEmissions } from './src/logic/calculator.js';
import { generateInsights } from './src/logic/insights.js';
import { saveToHistory, getHistory, getLatestRecord } from './src/utils/storage.js';

// --- DOM Elements ---
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('nav a');
const views = document.querySelectorAll('.view-section');
const activityForm = document.getElementById('activity-form');
const totalScoreEl = document.getElementById('total-score');
const insightsList = document.getElementById('insights-list');

// Progress Bars
const transportBar = document.getElementById('transport-bar');
const dietBar = document.getElementById('diet-bar');
const energyBar = document.getElementById('energy-bar');

// --- Navigation Logic ---
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    
    // Update active link
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Update active view
    views.forEach(view => {
      if (view.id === targetId) {
        view.style.display = 'block';
        setTimeout(() => view.classList.add('active'), 10); // Trigger animation
      } else {
        view.style.display = 'none';
        view.classList.remove('active');
      }
    });
  });
});

// --- Handle Form Submission ---
activityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get Values
  const transportMode = document.getElementById('transport-mode').value;
  const transportDist = document.getElementById('transport-dist').value;
  const dietType = document.getElementById('diet').value;
  const energyUsage = document.getElementById('energy').value;
  
  // Calculate Emissions
  const footprintData = calculateEmissions(transportMode, transportDist, dietType, energyUsage);
  
  // Save to History (LocalStorage)
  saveToHistory(footprintData);
  
  // Update UI
  updateDashboard();
  
  // Navigate back to dashboard
  document.querySelector('nav a[href="#dashboard"]').click();
  
  // Reset Form
  activityForm.reset();
});

// --- Update Dashboard UI ---
function updateDashboard() {
  const currentData = getLatestRecord() || { transport: 0, diet: 0, energy: 0, total: 0 };
  const history = getHistory();

  // Animate Total Score
  animateValue(totalScoreEl, parseFloat(totalScoreEl.innerText) || 0, currentData.total, 1000);
  
  // Update Status Text
  const statusEl = document.getElementById('score-status');
  if (currentData.total === 0) {
    statusEl.textContent = "Log your activities to see your footprint!";
    statusEl.style.color = "var(--text-secondary)";
  } else if (currentData.total < 8) {
    statusEl.textContent = "Excellent! You have a low carbon footprint today.";
    statusEl.style.color = "var(--success)";
  } else if (currentData.total < 15) {
    statusEl.textContent = "Average footprint. There's room for improvement.";
    statusEl.style.color = "var(--warning)";
  } else {
    statusEl.textContent = "High footprint. Check insights for ways to reduce it.";
    statusEl.style.color = "var(--danger)";
  }
  
  // Update Progress Bars (Relative to an arbitrary "max" for visual scaling)
  const MAX_EXPECTED = 15;
  transportBar.style.width = `${Math.min((currentData.transport / MAX_EXPECTED) * 100, 100)}%`;
  dietBar.style.width = `${Math.min((currentData.diet / MAX_EXPECTED) * 100, 100)}%`;
  energyBar.style.width = `${Math.min((currentData.energy / MAX_EXPECTED) * 100, 100)}%`;
  
  // Update Insights safely using DocumentFragment and textContent to prevent XSS
  const insights = generateInsights(currentData, history);
  
  // Clear previous list safely
  while (insightsList.firstChild) {
    insightsList.removeChild(insightsList.firstChild);
  }
  
  const fragment = document.createDocumentFragment();
  insights.forEach(insightText => {
    const li = document.createElement('li');
    li.textContent = insightText;
    fragment.appendChild(li);
  });
  
  insightsList.appendChild(fragment);
}

// --- Helper: Animate Number Counter ---
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = (progress * (end - start) + start).toFixed(1);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', updateDashboard);
