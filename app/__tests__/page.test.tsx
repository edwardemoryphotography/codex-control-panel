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

  it('shows honest draft lifecycle labels, never execution claims', async () => {
    render(<Home />)
    fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
      target: { value: 'Build a photo gallery app' },
    })
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))

    await waitFor(() => {
      expect(screen.getAllByText('No draft yet').length).toBeGreaterThan(0)
    })
    expect(
      screen.getAllByRole('button', { name: /generate draft/i }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(/never executes the routed action/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/executed/i)).not.toBeInTheDocument()
  })

  it('shows Draft failed and persists the failed run on the task record', async () => {
    render(<Home />)
    fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
      target: { value: 'Build a photo gallery app' },
    })
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))
    await waitFor(() => {
      expect(screen.getAllByText('No draft yet').length).toBeGreaterThan(0)
    })

    fireEvent.click(
      screen.getAllByRole('button', { name: /generate draft/i })[0],
    )
    await waitFor(() => {
      expect(screen.getByText('Draft failed')).toBeInTheDocument()
    })

    const stored = JSON.parse(
      localStorage.getItem('codex-control-panel-history-v2') ?? '[]',
    ) as Array<{ runs?: Record<string, { status: string; at: string }> }>
    expect(stored[0].runs?.['0']?.status).toBe('failed')
    expect(stored[0].runs?.['0']?.at).toBeTruthy()
  })

  it('deduplicates rapid route submissions (clicks + keyboard)', async () => {
    // A never-resolving fetch keeps the first request in flight while we
    // hammer the button and the Cmd+Enter shortcut.
    let resolveFetch: ((value: unknown) => void) | undefined
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<Home />)
    const textarea = screen.getByLabelText(/task \/ idea \/ request/i)
    fireEvent.change(textarea, { target: { value: 'Deploy the new build' } })

    const routeButton = screen.getByRole('button', { name: /route task/i })
    fireEvent.click(routeButton)
    fireEvent.click(routeButton)
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    // ControlPanel fetches /api/actions on mount, so total calls is 2 (actions + route).
    // The routing request should be deduped to a single /api/route call.
    const routeCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/route'))
    expect(routeCalls).toHaveLength(1)
    resolveFetch?.({ ok: false, status: 500, json: async () => ({}) })
    await waitFor(() => {
      expect(screen.getAllByText(/selected tool:/i).length).toBeGreaterThan(0)
    })
  })

  it('sends the stored access key and learned corrections with routing requests', async () => {
    localStorage.setItem(
      'codex-control-panel-access-key',
      JSON.stringify('secret-token'),
    )
    localStorage.setItem(
      'codex-control-panel-corrections-v1',
      JSON.stringify({ gallery: { documentation: 4 } }),
    )
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    render(<Home />)
    fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
      target: { value: 'Build a photo gallery app' },
    })
    fireEvent.click(screen.getByRole('button', { name: /route task/i }))

    await waitFor(() => {
      const routeCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/route'))
      expect(routeCalls).toHaveLength(1)
    })
    const routeCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/api/route')) as [string, RequestInit]
    const [, init] = routeCall
    expect(
      (init.headers as Record<string, string>)['x-codex-key'],
    ).toBe('secret-token')
    const payload = JSON.parse(String(init.body)) as {
      correctionHints: Array<{ key: string; weight: number }>
    }
    expect(payload.correctionHints).toEqual([
      { key: 'documentation', weight: 4 },
    ])
  })
})
