/**
 * Deterministic, rule-based priority engine — NOT AI or machine learning.
 *
 * Rules applied in order (first match wins):
 *  1. E-Waste with quantity_kg >= 5 kg → HIGH
 *     (Hazardous electronics in large volume)
 *  2. Any category with quantity_kg >= 10 kg → HIGH
 *     (Bulk pickup threshold)
 *  3. Organic waste → MEDIUM
 *     (Time-sensitive decomposition)
 *  4. Standard recyclables (Plastic, Paper, Glass, Metal) with quantity >= 5 kg → MEDIUM
 *     (Moderate volume recyclable)
 *  5. E-Waste with quantity_kg < 5 kg → MEDIUM
 *     (Regulated components requiring safe disposal)
 *  6. Otherwise → LOW
 *     (Standard category at manageable volume)
 *
 * @param {string} category    Waste category string
 * @param {number|string} quantityKg  Quantity in kilograms
 * @returns {{ priority: 'LOW'|'MEDIUM'|'HIGH', reason: string }}
 */
export function calculatePriority(category, quantityKg) {
  const qty = Number(quantityKg) || 0

  // Rule 1: E-Waste >= 5 kg
  if (category === 'E-Waste' && qty >= 5) {
    return {
      priority: 'HIGH',
      reason: `High priority because this is E-Waste with a quantity of ${qty} kg (hazardous + heavy volume).`,
    }
  }

  // Rule 2: Any category >= 10 kg
  if (qty >= 10) {
    return {
      priority: 'HIGH',
      reason: `High priority because this is ${category} with a quantity of ${qty} kg (bulk threshold ≥ 10 kg).`,
    }
  }

  // Rule 3: Organic waste (time-sensitive decomposition)
  if (category === 'Organic') {
    return {
      priority: 'MEDIUM',
      reason: `Medium priority because Organic waste requires timely collection before decomposition (${qty} kg).`,
    }
  }

  // Rule 4: Standard recyclables at moderate quantity (>= 5 kg)
  if (qty >= 5) {
    return {
      priority: 'MEDIUM',
      reason: `Medium priority because ${category} is a standard recyclable at moderate quantity (${qty} kg).`,
    }
  }

  // Rule 5: Small volume E-Waste (< 5 kg)
  if (category === 'E-Waste') {
    return {
      priority: 'MEDIUM',
      reason: `Medium priority because this is E-Waste (${qty} kg), requiring specialized electronics processing.`,
    }
  }

  // Rule 6: Otherwise LOW
  return {
    priority: 'LOW',
    reason: `Low priority because this is standard recyclable ${category} with a low quantity of ${qty} kg.`,
  }
}
