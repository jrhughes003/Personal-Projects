import type { Card } from '../engine/cards'
import { formatCount } from '../engine/counting'
import { deviationLabel, type Recommendation } from '../engine/deviations'
import { ACTION_LABELS, situationLabel } from '../engine/strategy'

/** The stats key and a one-line reason for a recommended play. */
export function describeDecision(cards: Card[], dealerUp: number, canSplit: boolean, rec: Recommendation, tc: number | null) {
  const situation = situationLabel(cards, dealerUp, canSplit)
  if (rec.deviation && tc !== null) {
    const d = rec.deviation
    return {
      key: `Index · ${deviationLabel(d).split(':')[0]}`,
      reason: `${d.group}: ${deviationLabel(d)}. At TC ${formatCount(Math.floor(tc))} → ${ACTION_LABELS[rec.action]}.`,
      deviation: true,
    }
  }
  return {
    key: situation,
    reason: `Basic strategy: ${situation} → ${ACTION_LABELS[rec.action]}.`,
    deviation: false,
  }
}
