export const ACCENT_TINTS = ['rust', 'amber'] as const

export type AccentTint = (typeof ACCENT_TINTS)[number]

export const DEFAULT_ACCENT_TINT: AccentTint = 'rust'

// Rust is the design system's reserved accent. Amber holds its warmth better at
// the low alpha this field runs at, and the pick is open until both are judged.
const TINT_TOKENS: Record<AccentTint, string> = {
  rust: '--accent',
  amber: '--chart-3',
}

const QUERY_KEY = 'tint'

function isAccentTint(value: string | null): value is AccentTint {
  return ACCENT_TINTS.some((tint) => tint === value)
}

export function resolveAccentTint(search: string): AccentTint {
  const requested = new URLSearchParams(search).get(QUERY_KEY)
  return isAccentTint(requested) ? requested : DEFAULT_ACCENT_TINT
}

export function readAccentToken(tint: AccentTint): string {
  return TINT_TOKENS[tint]
}
