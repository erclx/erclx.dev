import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders children as label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toMatch(/destructive/)
  })
})
