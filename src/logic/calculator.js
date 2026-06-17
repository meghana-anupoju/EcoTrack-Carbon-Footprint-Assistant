/**
 * Emission factors for different activities.
 * Values represent kg CO2 equivalents per unit.
 * @constant {Object}
 */
export const EMISSION_FACTORS = {
  transport: {
    car: 0.192, // per km
    ev: 0.05, // per km (varies by grid, using average)
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

/**
 * Validates the inputs to ensure they are safe numbers.
 * @param {number} value - The input value to validate.
 * @returns {number} The validated positive number, defaulting to 0 if invalid.
 */
export function sanitizeNumber(value) {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < 0) return 0;
  // Cap unrealistic inputs to prevent overflow/manipulation
  if (parsed > 10000) return 10000; 
  return parsed;
}

/**
 * Calculates the total emissions based on user inputs.
 * @param {string} transportMode - Mode of transport (e.g., 'car', 'ev').
 * @param {number} transportDist - Distance traveled in km.
 * @param {string} dietType - Type of diet (e.g., 'vegan', 'meat-heavy').
 * @param {number} energyUsage - Energy used in kWh.
 * @returns {Object} An object containing individual and total emissions.
 */
export function calculateEmissions(transportMode, transportDist, dietType, energyUsage) {
  // Validate mode and diet to prevent injection/errors
  const safeTransportMode = EMISSION_FACTORS.transport[transportMode] !== undefined ? transportMode : 'car';
  const safeDietType = EMISSION_FACTORS.diet[dietType] !== undefined ? dietType : 'average';
  
  const safeDist = sanitizeNumber(transportDist);
  const safeEnergy = sanitizeNumber(energyUsage);

  const transport = safeDist * EMISSION_FACTORS.transport[safeTransportMode];
  const diet = EMISSION_FACTORS.diet[safeDietType];
  const energy = safeEnergy * EMISSION_FACTORS.energy;

  return {
    transport: Number(transport.toFixed(2)),
    diet: Number(diet.toFixed(2)),
    energy: Number(energy.toFixed(2)),
    total: Number((transport + diet + energy).toFixed(2))
  };
}
