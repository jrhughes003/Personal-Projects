import type { Action, Availability } from '../engine/strategy'
import { ACTION_LABELS } from '../engine/strategy'
import { useHotkeys } from './useHotkeys'

const KEYS: Record<Action, string> = { hit: 'h', stand: 's', double: 'd', split: 'p', surrender: 'r' }
const ORDER: Action[] = ['hit', 'stand', 'double', 'split', 'surrender']

interface Props {
  avail: Availability
  onAction: (a: Action) => void
  disabled?: boolean
  /** Highlight the correct move after an answer. */
  correct?: Action
  chosen?: Action
}

export function ActionBar({ avail, onAction, disabled, correct, chosen }: Props) {
  const allowed = (a: Action) =>
    a === 'double' ? avail.canDouble : a === 'split' ? avail.canSplit : a === 'surrender' ? avail.canSurrender : true

  useHotkeys(
    Object.fromEntries(ORDER.map((a) => [KEYS[a], () => allowed(a) && onAction(a)])),
    !disabled,
  )

  return (
    <div className="action-bar">
      {ORDER.map((a) => {
        const state = correct === a ? 'is-correct' : chosen === a ? 'is-wrong' : ''
        return (
          <button key={a} className={`action ${state}`} disabled={disabled || !allowed(a)} onClick={() => onAction(a)}>
            {ACTION_LABELS[a]}
            <kbd>{KEYS[a].toUpperCase()}</kbd>
          </button>
        )
      })}
    </div>
  )
}
