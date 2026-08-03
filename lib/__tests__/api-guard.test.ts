import { describe, it, expect } from 'vitest'
import { rateLimit } from '../api-guard'

describe('rateLimit', () => {
  it('allows requests up to the limit and blocks beyond it', () => {
    const id = `test-${Math.random()}`
    const now = 1_000_000
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(id, 5, 60_000, now).ok).toBe(true)
    }
    const blocked = rateLimit(id, 5, 60_000, now)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('resets after the window elapses', () => {
    const id = `test-${Math.random()}`
    const now = 1_000_000
    for (let i = 0; i < 6; i++) rateLimit(id, 5, 60_000, now)
    expect(rateLimit(id, 5, 60_000, now).ok).toBe(false)
    expect(rateLimit(id, 5, 60_000, now + 61_000).ok).toBe(true)
  })

  it('tracks clients independently', () => {
    const a = `client-a-${Math.random()}`
    const b = `client-b-${Math.random()}`
    const now = 1_000_000
    for (let i = 0; i < 6; i++) rateLimit(a, 5, 60_000, now)
    expect(rateLimit(a, 5, 60_000, now).ok).toBe(false)
    expect(rateLimit(b, 5, 60_000, now).ok).toBe(true)
  })
})
