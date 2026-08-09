import { describe, it, expect } from 'vitest'
import { rateLimit, readJsonBody, requireOwner } from '../api-guard'

function requestWith(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/test', { headers })
}

describe('requireOwner (owner-only auth for paid AI endpoints)', () => {
  it('fails closed when AI keys exist but no APP_ACCESS_TOKEN is set', () => {
    const result = requireOwner(requestWith(), true, {})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(503)
      expect(result.error).toContain('APP_ACCESS_TOKEN')
    }
  })

  it('allows unauthenticated requests only when nothing paid is configured', () => {
    expect(requireOwner(requestWith(), false, {}).ok).toBe(true)
  })

  it('rejects missing or wrong tokens with 401', () => {
    const env = { APP_ACCESS_TOKEN: 'owner-secret' }
    const missing = requireOwner(requestWith(), true, env)
    expect(missing.ok).toBe(false)
    if (!missing.ok) expect(missing.status).toBe(401)

    const wrong = requireOwner(
      requestWith({ 'x-codex-key': 'not-it' }),
      true,
      env,
    )
    expect(wrong.ok).toBe(false)
    if (!wrong.ok) expect(wrong.status).toBe(401)
  })

  it('accepts the correct token via x-codex-key or bearer auth', () => {
    const env = { APP_ACCESS_TOKEN: 'owner-secret' }
    expect(
      requireOwner(requestWith({ 'x-codex-key': 'owner-secret' }), true, env)
        .ok,
    ).toBe(true)
    expect(
      requireOwner(
        requestWith({ authorization: 'Bearer owner-secret' }),
        true,
        env,
      ).ok,
    ).toBe(true)
  })

  it('applies the gate even when AI is not configured, once a token exists', () => {
    const env = { APP_ACCESS_TOKEN: 'owner-secret' }
    const result = requireOwner(requestWith(), false, env)
    expect(result.ok).toBe(false)
  })
})

describe('readJsonBody (real request-body limit)', () => {
  function postRequest(body: string, headers: Record<string, string> = {}) {
    return new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body,
    })
  }

  it('parses valid JSON under the limit', async () => {
    const result = await readJsonBody(postRequest('{"task":"hi"}'), 1024)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual({ task: 'hi' })
  })

  it('rejects bodies over the byte limit with 413', async () => {
    const big = JSON.stringify({ task: 'x'.repeat(2048) })
    const result = await readJsonBody(postRequest(big), 1024)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(413)
  })

  it('rejects oversized declared content-length without reading', async () => {
    const result = await readJsonBody(
      postRequest('{}', { 'content-length': '999999' }),
      1024,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(413)
  })

  it('rejects malformed JSON with 400', async () => {
    const result = await readJsonBody(postRequest('not json'), 1024)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(400)
  })
})

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
