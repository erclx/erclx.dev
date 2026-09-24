/**
 * The line the share card draws beside the mark, held here rather than in the
 * script that draws it.
 *
 * It is the page header's line, so the header shows the same words the card
 * does. `src/test/rendered-copy.test.ts` asserts the header carries it and that
 * no page's description repeats it, and importing the script would run it,
 * since that file launches a browser at the top level.
 */
export const CARD_CLAIM = 'I build AI tools, mostly ones I needed myself first.'
