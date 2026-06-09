// test.js
// Lightweight test runner for Carbon Footprint calculations

const EMISSION_FACTORS = {
  transport: {
    car: 0.192,
    ev: 0.05,
    public: 0.04,
    bike: 0
  },
  diet: {
    'meat-heavy': 3.3,
    'average': 2.5,
    'vegetarian': 1.7,
    'vegan': 1.5
  },
  energy: 0.385
};

function calculateEmissions(transportMode, transportDist, dietType, energyUsage) {
  const transportEmissions = transportDist * EMISSION_FACTORS.transport[transportMode];
  const dietEmissions = EMISSION_FACTORS.diet[dietType];
  const energyEmissions = energyUsage * EMISSION_FACTORS.energy;
  return transportEmissions + dietEmissions + energyEmissions;
}

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, testName) {
  // Allow small floating point differences
  if (Math.abs(actual - expected) < 0.001) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} | Expected ${expected}, but got ${actual}`);
    failed++;
  }
}

console.log("Running Tests for EcoTrack Calculation Engine...\n");

// Test 1: Zero values
assertEqual(calculateEmissions('bike', 0, 'vegan', 0), 1.5, "Zero usage with vegan diet");

// Test 2: Car travel
assertEqual(calculateEmissions('car', 10, 'average', 0), (10 * 0.192) + 2.5, "10km Car + Average Diet");

// Test 3: Mixed High Usage
assertEqual(calculateEmissions('car', 50, 'meat-heavy', 20), (50 * 0.192) + 3.3 + (20 * 0.385), "High footprint scenario");

// Test 4: Low Impact
assertEqual(calculateEmissions('ev', 5, 'vegetarian', 5), (5 * 0.05) + 1.7 + (5 * 0.385), "Low impact scenario");

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("All tests passed successfully!");
}
