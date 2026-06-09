import './style.css';

// State Management
let footprintData = {
  transport: 0,
  diet: 0,
  energy: 0,
  total: 0,
  history: []
};

// DOM Elements
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

// Navigation Logic
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

// Emission Factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.192, // per km
    ev: 0.05, // per km (varies by grid)
    public: 0.04, // per km
    bike: 0 // per km
  },
  diet: {
    'meat-heavy': 3.3, // per day
    'average': 2.5, // per day
    'vegetarian': 1.7, // per day
    'vegan': 1.5 // per day
  },
  energy: 0.385 // per kWh (average global grid)
};

// Handle Form Submission
activityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get Values
  const transportMode = document.getElementById('transport-mode').value;
  const transportDist = parseFloat(document.getElementById('transport-dist').value) || 0;
  const dietType = document.getElementById('diet').value;
  const energyUsage = parseFloat(document.getElementById('energy').value) || 0;
  
  // Calculate Emissions
  const transportEmissions = transportDist * EMISSION_FACTORS.transport[transportMode];
  const dietEmissions = EMISSION_FACTORS.diet[dietType];
  const energyEmissions = energyUsage * EMISSION_FACTORS.energy;
  
  // Update State
  footprintData.transport = transportEmissions;
  footprintData.diet = dietEmissions;
  footprintData.energy = energyEmissions;
  footprintData.total = transportEmissions + dietEmissions + energyEmissions;
  
  // Save to History (Mock backend behavior)
  footprintData.history.push({
    date: new Date().toISOString(),
    ...footprintData
  });
  
  // Update UI
  updateDashboard();
  
  // Navigate back to dashboard
  document.querySelector('nav a[href="#dashboard"]').click();
  
  // Reset Form
  activityForm.reset();
});

// Smart Insights Engine
function generateInsights() {
  const insights = [];
  
  // Transport Insights
  if (footprintData.transport > 5) {
    insights.push("Your transport emissions are high. Consider carpooling, using public transit, or switching to an EV.");
  } else if (footprintData.transport > 0) {
    insights.push("Great job keeping transport emissions moderate! Could you swap one car trip for a bike ride this week?");
  }
  
  // Diet Insights
  if (footprintData.diet > 2.5) {
    insights.push("Meat-heavy diets significantly increase your footprint. Try a 'Meatless Monday' to reduce your impact.");
  } else if (footprintData.diet < 2) {
    insights.push("Your plant-based diet is a major contributor to keeping your footprint low. Keep it up!");
  }
  
  // Energy Insights
  if (footprintData.energy > 5) {
    insights.push("Home energy use is elevated. Simple actions like unplugging idle devices and switching to LED bulbs can help.");
  }
  
  // Generic / Praise
  if (footprintData.total < 8 && footprintData.total > 0) {
    insights.push("You are doing exceptionally well! Your daily footprint is below average.");
  }
  
  if (insights.length === 0) {
    insights.push("Start logging activities to receive personalized recommendations.");
  }
  
  return insights;
}

// Update Dashboard UI
function updateDashboard() {
  // Animate Total Score
  animateValue(totalScoreEl, parseFloat(totalScoreEl.innerText), footprintData.total, 1000);
  
  // Update Status Text
  const statusEl = document.getElementById('score-status');
  if (footprintData.total < 8) {
    statusEl.innerText = "Excellent! You have a low carbon footprint today.";
    statusEl.style.color = "var(--success)";
  } else if (footprintData.total < 15) {
    statusEl.innerText = "Average footprint. There's room for improvement.";
    statusEl.style.color = "var(--warning)";
  } else {
    statusEl.innerText = "High footprint. Check insights for ways to reduce it.";
    statusEl.style.color = "var(--danger)";
  }
  
  // Update Progress Bars (Relative to an arbitrary "max" for visual scaling)
  const MAX_EXPECTED = 15;
  transportBar.style.width = `${Math.min((footprintData.transport / MAX_EXPECTED) * 100, 100)}%`;
  dietBar.style.width = `${Math.min((footprintData.diet / MAX_EXPECTED) * 100, 100)}%`;
  energyBar.style.width = `${Math.min((footprintData.energy / MAX_EXPECTED) * 100, 100)}%`;
  
  // Update Insights
  const insights = generateInsights();
  insightsList.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
}

// Helper: Animate Number Counter
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = (progress * (end - start) + start).toFixed(1);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Initialize
updateDashboard();
