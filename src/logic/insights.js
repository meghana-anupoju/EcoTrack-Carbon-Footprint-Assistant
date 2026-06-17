/**
 * Generates personalized, actionable insights based on the footprint data.
 * @param {Object} currentData - The current footprint calculation data.
 * @param {Array<Object>} history - Historical footprint data from localStorage.
 * @returns {Array<string>} An array of insight strings.
 */
export function generateInsights(currentData, history = []) {
  if (!currentData || typeof currentData.total !== 'number') {
    return ["Start logging activities to receive personalized recommendations."];
  }
  
  const insights = [];
  
  // Transport Insights
  if (currentData.transport > 5) {
    insights.push("Your transport emissions are high. Consider carpooling, using public transit, or switching to an EV.");
  } else if (currentData.transport > 0) {
    insights.push("Great job keeping transport emissions moderate! Swap one car trip for a bike ride this week to go even lower.");
  }
  
  // Diet Insights
  if (currentData.diet > 2.5) {
    insights.push("Meat-heavy diets significantly increase your footprint. Try a 'Meatless Monday' to reduce your impact.");
  } else if (currentData.diet < 2) {
    insights.push("Your plant-based diet is a major contributor to keeping your footprint low. Keep it up!");
  }
  
  // Energy Insights
  if (currentData.energy > 5) {
    insights.push("Home energy use is elevated. Simple actions like unplugging idle devices and switching to LED bulbs can help.");
  }
  
  // Generic / Praise
  if (currentData.total < 8 && currentData.total > 0) {
    insights.push("You are doing exceptionally well! Your daily footprint is below average.");
  }
  
  // Historical Comparison (if previous data exists)
  if (history.length > 1) {
    const previousRecord = history[history.length - 2];
    if (currentData.total < previousRecord.total) {
      const diff = (previousRecord.total - currentData.total).toFixed(1);
      insights.push(`Awesome! You reduced your total footprint by ${diff} kg CO₂ compared to your last log.`);
    } else if (currentData.total > previousRecord.total) {
      insights.push("Your footprint is slightly higher than your last log. Check the breakdown to see where you can optimize tomorrow!");
    }
  }

  if (insights.length === 0) {
    insights.push("Start logging activities to receive personalized recommendations.");
  }
  
  return insights;
}
