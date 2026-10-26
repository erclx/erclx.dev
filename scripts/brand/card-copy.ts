/**
 * The line the share card draws beside the mark, held here rather than in the
 * script that draws it.
 *
 * It comes from the career source's `share-card.md`, whose line the page
 * header matches today. `src/test/rendered-copy.test.ts` asserts the header
 * carries it and that no page's description repeats it, and importing the
 * script would run it, since that file launches a browser at the top level.
 */
export const CARD_CLAIM = 'I build AI agents and developer tools.'
