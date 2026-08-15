const TRIGGER_SELECTOR = '[data-figure-zoom]'
const DIALOG_SELECTOR = '[data-figure-dialog]'
const DIALOG_IMAGE_SELECTOR = '[data-figure-dialog-image]'
const DIALOG_CAPTION_SELECTOR = '[data-figure-dialog-caption]'
const CLOSE_SELECTOR = '[data-figure-close]'

/**
 * Opens a raster figure into the page's single `<dialog>` at its own
 * resolution. The native modal carries focus trapping, the backdrop, and
 * Escape-to-close, and returns focus to the trigger on close.
 */
export function initFigureZoom(): void {
  if (typeof window === 'undefined') return

  const dialog = document.querySelector<HTMLDialogElement>(DIALOG_SELECTOR)
  if (!dialog || typeof dialog.showModal !== 'function') return

  const image = dialog.querySelector<HTMLImageElement>(DIALOG_IMAGE_SELECTOR)
  const caption = dialog.querySelector<HTMLElement>(DIALOG_CAPTION_SELECTOR)
  if (!image) return

  const triggers = document.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)
  for (const trigger of triggers) {
    trigger.addEventListener('click', () => {
      const source = trigger.querySelector('img')
      if (!source) return

      image.src = source.currentSrc || source.src
      image.alt = source.alt
      if (caption) {
        const figcaption = trigger
          .closest('figure')
          ?.querySelector('figcaption')
        caption.textContent = figcaption?.textContent?.trim() ?? ''
      }
      dialog.showModal()
    })
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  dialog.querySelector(CLOSE_SELECTOR)?.addEventListener('click', () => {
    dialog.close()
  })
}
