import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initHoverVideo } from './hover-video'

// jsdom implements no media playback, so playing a video records which one was
// asked rather than decoding anything.
const played: HTMLVideoElement[] = []

function stubMedia(): void {
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(
    function (this: HTMLVideoElement) {
      played.push(this)
      return Promise.resolve()
    },
  )
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(
    () => undefined,
  )
}

// A hover-capable desktop with no reduced-motion preference.
function stubDesktop(): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('pointer: coarse'),
    media: query,
  }))
}

describe('initHoverVideo', () => {
  beforeEach(() => {
    played.length = 0
    stubMedia()
    stubDesktop()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('plays only the clip the current theme displays', () => {
    document.body.innerHTML = `
      <article data-media-host>
        <video data-media-video data-theme-clip="light" style="display: none"></video>
        <video data-media-video data-theme-clip="dark"></video>
      </article>`
    initHoverVideo()

    document
      .querySelector('[data-media-host]')
      ?.dispatchEvent(new Event('pointerenter'))

    expect(played.map((video) => video.dataset.themeClip)).toEqual(['dark'])
  })

  it('plays a lone clip on hover', () => {
    document.body.innerHTML = `
      <article data-media-host>
        <video data-media-video></video>
      </article>`
    initHoverVideo()

    document
      .querySelector('[data-media-host]')
      ?.dispatchEvent(new Event('pointerenter'))

    expect(played).toHaveLength(1)
  })
})
