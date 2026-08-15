import { describe, expect, it } from 'vitest'

import { getLinkTargetAttributes, isOutbound } from './links'

describe('isOutbound', () => {
  it('should treat an https destination as outbound', () => {
    expect(isOutbound('https://github.com/erclx/aitk')).toBe(true)
  })

  it('should treat a root-relative path as internal', () => {
    expect(isOutbound('/aitk')).toBe(false)
  })

  it('should treat a mailto handoff as internal', () => {
    expect(isOutbound('mailto:me@erclx.dev')).toBe(false)
  })
})

describe('getLinkTargetAttributes', () => {
  it('should open an outbound link in a new tab', () => {
    expect(
      getLinkTargetAttributes('https://www.npmjs.com/package/@erclx/aitk'),
    ).toEqual({ target: '_blank', rel: 'noopener' })
  })

  it('should pair every new-tab target with the noopener relationship', () => {
    const attributes = getLinkTargetAttributes('https://jobtriage.erclx.dev')

    expect(attributes.rel).toBe('noopener')
  })

  it('should leave internal navigation in the current tab', () => {
    expect(getLinkTargetAttributes('/jobtriage')).toEqual({})
  })
})
