// ============================================================================
// HELPERS
// ============================================================================

/** Maps sales stage to default probability percentage */
export const STAGE_PROBABILITY_MAP: Record<string, number> = {
  LEAD_QUALIFICATION: 10,
  PROSPECTING: 20,
  NEEDS_ANALYSIS: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  COMMITMENT: 90,
};

/**
 * Calculates weighted value from estimated value and probability
 * @param estimatedValue - The estimated deal value (null if not set)
 * @param probability    - Probability percentage (0–100)
 */
export const calculateWeightedValue = (
  estimatedValue: number | null,
  probability: number,
): number => {
  if (!estimatedValue) return 0;
  return (estimatedValue * probability) / 100;
};
