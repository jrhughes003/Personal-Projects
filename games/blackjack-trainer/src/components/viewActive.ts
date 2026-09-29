import { createContext } from 'react'

/**
 * False for screens kept mounted in the background (so a shoe survives a trip
 * to the Reference page); their keyboard shortcuts switch off.
 */
export const ViewActiveContext = createContext(true)
