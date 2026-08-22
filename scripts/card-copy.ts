/**
 * The sentence the share card draws, held here rather than in the script that
 * draws it.
 *
 * `e2e/share-card.spec.ts` needs it to assert that no page's description
 * repeats it, and importing the script would run it, since that file launches a
 * browser at the top level. One declaration, read by both.
 */
export const CARD_CLAIM =
  'I build the layer between a language model and the job it has to do.'
