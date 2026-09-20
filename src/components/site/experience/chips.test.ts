import { describe, expect, it } from 'vitest'

import {
  type ChipRowEvent,
  type ChipRowState,
  ENTER_RATIO,
  REARM_RATIO,
  reduceChipRow,
} from './chips'

const armed: ChipRowState = { isArmed: true }
const spent: ChipRowState = { isArmed: false }

const seen = (ratio: number, isMotionReduced = false): ChipRowEvent => ({
  kind: 'seen',
  ratio,
  isMotionReduced,
})

describe('reduceChipRow', () => {
  it('should wave and spend the arming when an armed row reaches the enter ratio', () => {
    const result = reduceChipRow(armed, seen(ENTER_RATIO))

    expect(result).toEqual({ state: spent, action: 'wave' })
  })

  it('should wave when an armed row is fully visible', () => {
    const result = reduceChipRow(armed, seen(1))

    expect(result).toEqual({ state: spent, action: 'wave' })
  })

  it('should stay armed and quiet while an armed row is only partly visible', () => {
    const result = reduceChipRow(armed, seen(ENTER_RATIO - 0.01))

    expect(result).toEqual({ state: armed, action: 'none' })
  })

  it('should stay armed and quiet just above the rearm ratio', () => {
    const result = reduceChipRow(armed, seen(REARM_RATIO + 0.01))

    expect(result).toEqual({ state: armed, action: 'none' })
  })

  it('should not wave again while a spent row stays in view', () => {
    const result = reduceChipRow(spent, seen(1))

    expect(result).toEqual({ state: spent, action: 'none' })
  })

  it('should stay spent and quiet when a spent row shrinks but remains partly visible', () => {
    const result = reduceChipRow(spent, seen(REARM_RATIO + 0.01))

    expect(result).toEqual({ state: spent, action: 'none' })
  })

  it('should rearm and darken when a spent row leaves entirely', () => {
    const result = reduceChipRow(spent, seen(REARM_RATIO))

    expect(result).toEqual({ state: armed, action: 'darken' })
  })

  it('should darken and stay armed when an armed row leaves entirely', () => {
    const result = reduceChipRow(armed, seen(REARM_RATIO))

    expect(result).toEqual({ state: armed, action: 'darken' })
  })

  it('should spend the arming without a wave when motion is reduced', () => {
    const result = reduceChipRow(armed, seen(ENTER_RATIO, true))

    expect(result).toEqual({ state: spent, action: 'none' })
  })

  it('should still rearm when motion is reduced and the row leaves', () => {
    const result = reduceChipRow(spent, seen(REARM_RATIO, true))

    expect(result).toEqual({ state: armed, action: 'darken' })
  })

  it('should darken a wave in flight when the preference turns on', () => {
    const result = reduceChipRow(spent, { kind: 'motion-reduced' })

    expect(result).toEqual({ state: spent, action: 'darken' })
  })

  it('should leave the arming alone when the preference turns on', () => {
    const result = reduceChipRow(armed, { kind: 'motion-reduced' })

    expect(result).toEqual({ state: armed, action: 'darken' })
  })
})
