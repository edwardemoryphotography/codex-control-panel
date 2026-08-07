import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  providerOrder,
  configuredModel,
  keyDiagnostics,
  isAuthFailure,
} from '../llm'

describe('providerOrder (provider policy, separate from failover)', () => {
  it('defaults to anthropic then openai for both purposes', () => {
    expect(providerOrder('classify', {})).toEqual(['anthropic', 'openai'])
    expect(providerOrder('generate', {})).toEqual(['anthropic', 'openai'])
  })

  it('honors per-purpose env overrides', () => {
    expect(
      providerOrder('classify', { LLM_CLASSIFY_ORDER: 'openai,anthropic' }),
    ).toEqual(['openai', 'anthropic'])
    expect(
      providerOrder('generate', { LLM_GENERATE_ORDER: 'openai' }),
    ).toEqual(['openai'])
  })

  it('keeps purposes independent', () => {
    const env = { LLM_CLASSIFY_ORDER: 'openai' }
    expect(providerOrder('classify', env)).toEqual(['openai'])
    expect(providerOrder('generate', env)).toEqual(['anthropic', 'openai'])
  })

  it('ignores invalid entries and dedupes', () => {
    expect(
      providerOrder('classify', {
        LLM_CLASSIFY_ORDER: 'gemini, openai, openai ,anthropic',
      }),
    ).toEqual(['openai', 'anthropic'])
    // Entirely invalid override falls back to the default policy.
    expect(providerOrder('classify', { LLM_CLASSIFY_ORDER: 'gemini' })).toEqual([
      'anthropic',
      'openai',
    ])
  })
})

describe('configuredModel', () => {
  it('reports whether the model came from env or a library default', () => {
    const status = configuredModel('openai')
    expect(typeof status.model).toBe('string')
    expect(typeof status.explicit).toBe('boolean')
  })
})

describe('keyDiagnostics (catches paste accidents behind 401s)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is silent when keys are absent or well-formed', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    vi.stubEnv('OPENAI_API_KEY', 'sk-proj-abcdef123456')
    expect(keyDiagnostics()).toEqual([])
  })

  it('warns about surrounding whitespace (trailing newline paste)', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-abc123\n')
    vi.stubEnv('OPENAI_API_KEY', '')
    const warnings = keyDiagnostics()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('whitespace')
    expect(warnings[0]).toContain('ANTHROPIC_API_KEY')
  })

  it('warns when the key prefix looks wrong', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'ant-not-a-real-prefix')
    vi.stubEnv('OPENAI_API_KEY', '')
    const warnings = keyDiagnostics()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('sk-ant-')
  })

  it('warns about internal whitespace (truncated paste)', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    vi.stubEnv('OPENAI_API_KEY', 'sk-abc def')
    const warnings = keyDiagnostics()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('internal whitespace')
  })
})

describe('isAuthFailure', () => {
  it('recognizes provider auth rejections', () => {
    expect(
      isAuthFailure(
        'anthropic: Anthropic 401: {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}',
      ),
    ).toBe(true)
    expect(isAuthFailure('openai: OpenAI 401: Incorrect API key provided')).toBe(
      true,
    )
  })

  it('does not flag unrelated failures', () => {
    expect(isAuthFailure('anthropic: Anthropic 529: overloaded')).toBe(false)
    expect(isAuthFailure('openai: fetch failed (timeout)')).toBe(false)
  })
})
