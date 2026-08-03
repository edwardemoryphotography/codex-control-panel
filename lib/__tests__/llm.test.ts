import { describe, it, expect } from 'vitest'
import { providerOrder, configuredModel } from '../llm'

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
