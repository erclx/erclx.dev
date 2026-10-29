import type { Page } from '@playwright/test'

import type { CaptureCase, CaptureSection } from '../capture-types'

/** Where a case flagged `evidence: true` writes its committed frames. */
export const EVIDENCE_ROOT = '.github/evidence/surfaces'

/**
 * The landing page's sections, top to bottom. Each is its own frame, so a
 * diff lands on the section that moved rather than on one image of the page.
 */
const HOME_SECTIONS: CaptureSection[] = [
  { name: 'header', selector: '[data-section="header"]' },
  { name: 'about', selector: '[data-section="about"]' },
  { name: 'experience', selector: '[data-section="experience"]' },
  { name: 'projects', selector: '[data-section="projects"]' },
  { name: 'looking-for', selector: '[data-section="looking-for"]' },
  { name: 'footer', selector: '[data-section="footer"]' },
]

/** Every route beside the landing page, each captured whole in one frame. */
const ROUTES = [
  'canon',
  'jobtriage',
  'annex',
  'stackr',
  'caret',
  'frameboard',
  'resume',
] as const

/** The footer's build date moves on every build with no code change. */
const MASK = ['[data-updated]']

/**
 * The harness waits for every image to report complete, and a lazy poster
 * hidden by the other theme never does. Loading it eagerly changes nothing a
 * frame shows.
 */
const settleImages = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      for (const image of document.querySelectorAll('img')) {
        if (image.loading === 'lazy') image.loading = 'eager'
      }
    })
  })
}

const darkScheme = async (page: Page) => {
  await settleImages(page)
  await page.emulateMedia({ colorScheme: 'dark' })
}

export const CASES: CaptureCase[] = [
  {
    section: 'home',
    theme: 'default',
    route: '/',
    evidence: true,
    mask: MASK,
    sections: HOME_SECTIONS,
    setup: settleImages,
  },
  {
    section: 'home',
    theme: 'dark',
    route: '/',
    mask: MASK,
    sections: HOME_SECTIONS,
    setup: darkScheme,
  },
  ...ROUTES.flatMap((route): CaptureCase[] => [
    {
      section: route,
      theme: 'default',
      route: `/${route}`,
      evidence: true,
      setup: settleImages,
    },
    {
      section: route,
      theme: 'dark',
      route: `/${route}`,
      setup: darkScheme,
    },
  ]),
]
