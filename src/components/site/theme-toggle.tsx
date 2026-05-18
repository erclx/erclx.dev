import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Mode = 'light' | 'dark' | 'system'

const NEXT: Record<Mode, Mode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

function readMode(): Mode {
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

function applyMode(mode: Mode): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
  if (mode === 'system') {
    window.localStorage.removeItem('theme')
  } else {
    window.localStorage.setItem('theme', mode)
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(() => readMode())

  useEffect(() => {
    applyMode(mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyMode('system')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setMode(NEXT[mode])}
            className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          Cycle theme
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
