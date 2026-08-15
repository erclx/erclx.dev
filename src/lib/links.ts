interface LinkTargetAttributes {
  readonly target?: '_blank'
  readonly rel?: 'noopener'
}

export function isOutbound(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

/**
 * Attributes that send a link to a new tab, spread onto an anchor. Returns an
 * empty set for internal navigation and for a `mailto:` handoff, which replaces
 * no page. See `.claude/rules/ui/455-links.md`.
 */
export function getLinkTargetAttributes(href: string): LinkTargetAttributes {
  return isOutbound(href) ? { target: '_blank', rel: 'noopener' } : {}
}
