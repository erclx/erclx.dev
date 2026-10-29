import { getLinkTargetAttributes } from '@/lib/links'

type LinkTargetAttributes = ReturnType<typeof getLinkTargetAttributes>

export interface ContactLink {
  readonly label: string
  readonly href: string
  /** The attributes the anchor spreads, decided here so no surface applies the link rule itself. */
  readonly attributes: LinkTargetAttributes
  /** Lucide outline paths on a 24-unit grid, drawn at 1.5px stroke. */
  readonly paths: readonly string[]
}

function contact(link: Omit<ContactLink, 'attributes'>): ContactLink {
  return { ...link, attributes: getLinkTargetAttributes(link.href) }
}

/**
 * Where to reach the author, held once because the hero, the dock, the closing
 * ask, and the footer each render some of it. A URL changed in one copy and
 * not the others was the drift this replaced.
 */
export const github = contact({
  label: 'GitHub',
  href: 'https://github.com/erclx',
  paths: [
    'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
    'M9 18c-4.51 2-5-2-7-2',
  ],
})

export const linkedin = contact({
  label: 'LinkedIn',
  href: 'https://www.linkedin.com/in/erclx',
  paths: [
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
    'M2 9h4v12H2z',
    'M4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  ],
})

export const email = contact({
  label: 'me@erclx.dev',
  href: 'mailto:me@erclx.dev',
  paths: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  ],
})

// The route rather than the file, so the tab carries the site's icon and a
// real title. The route's own Open PDF link carries the new-tab exemption.
export const resume = contact({
  label: 'Résumé',
  href: '/resume',
  paths: [
    'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z',
    'M14 2v5h5',
    'M9 13h6',
    'M9 17h4',
  ],
})
