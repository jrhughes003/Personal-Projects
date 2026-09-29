import { useEffect, useRef } from 'react'

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'submit'])

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(target.type)
  return target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'
}

/** Single-key shortcuts, ignored while typing in a field. Keys are lower-case `event.key` values. */
export function useHotkeys(map: Record<string, () => void>, enabled = true): void {
  const ref = useRef(map)
  ref.current = map
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const fn = ref.current[e.key.toLowerCase()]
      if (fn) {
        e.preventDefault()
        fn()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
