import { calculateEmissions } from '../logic/calculator.js';
import { generateInsights } from '../logic/insights.js';
import { saveToHistory, getHistory, getLatestRecord, clearHistory } from '../utils/storage.js';

export function initDashboard() {
  try {
    const navLinks = document.querySelectorAll('nav a');
    const views = document.querySelectorAll('.view-section');
    const activityForm = document.getElementById('activity-form');
    const totalScoreEl = document.getElementById('total-score');
    const insightsList = document.getElementById('insights-list');
    const transportBar = document.getElementById('transport-bar');
    const dietBar = document.getElementById('diet-bar');
    const energyBar = document.getElementById('energy-bar');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Navigation Logic
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');

        views.forEach((view) => {
          if (view.id === targetId) {
            view.style.display = 'block';
            window.setTimeout(() => view.classList.add('active'), 10);
          } else {
            view.style.display = 'none';
            view.classList.remove('active');
          }
        });
      });
    });

    // Clear History Logic
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        clearHistory();
        updateDashboard(totalScoreEl, transportBar, dietBar, energyBar, insightsList);
      });
    }

    // Form Submission Logic
    if (activityForm) {
      activityForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const transportMode = document.getElementById('transport-mode')?.value;
        const transportDist = document.getElementById('transport-dist')?.value;
        const dietType = document.getElementById('diet')?.value;
        const energyUsage = document.getElementById('energy')?.value;

        const footprintData = calculateEmissions(
          transportMode,
          transportDist,
          dietType,
          energyUsage
        );

        saveToHistory(footprintData);
        updateDashboard(totalScoreEl, transportBar, dietBar, energyBar, insightsList);

        const dashboardLink = document.querySelector('nav a[href="#dashboard"]');
        if (dashboardLink) dashboardLink.click();

        activityForm.reset();
      });
    }

    // Initialize Dashboard
    updateDashboard(totalScoreEl, transportBar, dietBar, energyBar, insightsList);
  } catch {
    // Graceful fail in non-browser environments (e.g. tests without DOM fully set)
  }
}

export function updateDashboard(totalScoreEl, transportBar, dietBar, energyBar, insightsList) {
  if (!totalScoreEl || !transportBar || !dietBar || !energyBar || !insightsList) return;

  const currentData = getLatestRecord() || { transport: 0, diet: 0, energy: 0, total: 0 };
  const history = getHistory();

  animateValue(totalScoreEl, parseFloat(totalScoreEl.textContent) || 0, currentData.total, 1000);

  const statusEl = document.getElementById('score-status');
  if (statusEl) {
    if (currentData.total === 0) {
      statusEl.textContent = 'Log your activities to see your footprint!';
      statusEl.style.color = 'var(--text-secondary)';
    } else if (currentData.total < 8) {
      statusEl.textContent = 'Excellent! You have a low carbon footprint today.';
      statusEl.style.color = 'var(--success)';
    } else if (currentData.total < 15) {
      statusEl.textContent = "Average footprint. There's room for improvement.";
      statusEl.style.color = 'var(--warning)';
    } else {
      statusEl.textContent = 'High footprint. Check insights for ways to reduce it.';
      statusEl.style.color = 'var(--danger)';
    }
  }

  const MAX_EXPECTED = 15;
  transportBar.style.width = `${Math.min((currentData.transport / MAX_EXPECTED) * 100, 100)}%`;
  dietBar.style.width = `${Math.min((currentData.diet / MAX_EXPECTED) * 100, 100)}%`;
  energyBar.style.width = `${Math.min((currentData.energy / MAX_EXPECTED) * 100, 100)}%`;

  const insights = generateInsights(currentData, history);

  while (insightsList.firstChild) {
    insightsList.removeChild(insightsList.firstChild);
  }

  const fragment = document.createDocumentFragment();
  insights.forEach((insightText) => {
    const li = document.createElement('li');
    li.textContent = insightText;
    fragment.appendChild(li);
  });

  insightsList.appendChild(fragment);
}

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
