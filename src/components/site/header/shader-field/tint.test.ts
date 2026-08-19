import { describe, expect, it } from 'vitest'

import { DEFAULT_ACCENT_TINT, readAccentToken, resolveAccentTint } from './tint'

describe('resolveAccentTint', () => {
  it('should return the default when the search string is empty', () => {
    const tint = resolveAccentTint('')

    expect(tint).toBe(DEFAULT_ACCENT_TINT)
  })

  it('should return amber when the query asks for it', () => {
    const tint = resolveAccentTint('?tint=amber')

    expect(tint).toBe('amber')
  })

  it('should fall back to the default on an unknown tint', () => {
    const tint = resolveAccentTint('?tint=teal')

    expect(tint).toBe(DEFAULT_ACCENT_TINT)
  })
})

describe('readAccentToken', () => {
  it('should map rust to the reserved accent token', () => {
    const token = readAccentToken('rust')

    expect(token).toBe('--accent')
  })

  it('should map amber to a distinct token', () => {
    const token = readAccentToken('amber')

    expect(token).not.toBe(readAccentToken('rust'))
  })
})
