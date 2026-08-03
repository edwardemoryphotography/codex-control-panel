import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Home from '../page'

describe('Home page — control panel', () => {
  beforeEach(() => {
    localStorage.clear()
    // Simulate the AI routing API being unreachable so the panel falls
    // back to the local doctrine router (deterministic for tests).
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline')),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the brand and hero', () => {
    render(<Home />)
    expect(screen.getByText('Codex Control Panel')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(/route/i)
  })

  it('shows an inline error when routing with an empty task', async () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /describe a task first/i,
    )
  })

  it('routes a task and renders the output cards (doctrine fallback)', async () => {
    render(<Home />)
    fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
      target: {
        value: 'Build a photo gallery app and deploy it to Vercel',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/selected tool:/i).length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Doctrine routing')).toBeInTheDocument()
    expect(document.getElementById('summaryRoute')?.textContent).not.toBe('—')
  })

  it('toggles the iOS-style switches', () => {
    render(<Home />)
    const override = screen.getByRole('switch', { name: /execution override/i })
    expect(override).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(override)
    expect(override).toHaveAttribute('aria-checked', 'false')
  })

  it('changes the active priority segment', () => {
    render(<Home />)
    const speed = screen.getByRole('button', { name: 'Speed' })
    const balanced = screen.getByRole('button', { name: 'Balanced' })
    expect(balanced).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(speed)
    expect(speed).toHaveAttribute('aria-pressed', 'true')
    expect(balanced).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches theme via the header toggle', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
    })
    const before = document.documentElement.getAttribute('data-theme')
    fireEvent.click(screen.getByRole('button', { name: /switch to .* theme/i }))
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).not.toBe(before)
    })
  })

  it('saves routed tasks into history', async () => {
    render(<Home />)
    fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
      target: { value: 'Research current astrophotography pricing' },
    })
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))
    await waitFor(() => {
      expect(
        screen.getByText(/research current astrophotography pricing/i),
      ).toBeInTheDocument()
    })
    const stored = JSON.parse(
      localStorage.getItem('codex-control-panel-history-v2') ?? '[]',
    )
    expect(stored).toHaveLength(1)
  })
})
