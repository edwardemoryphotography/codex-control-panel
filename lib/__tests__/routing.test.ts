import { describe, it, expect } from 'vitest'
import {
  buildResult,
  buildResultFromDecision,
  correctionHints,
  parseAiDecision,
  applyCorrection,
  scoreRoute,
  type BuildResultInput,
} from '../routing'

function input(overrides: Partial<BuildResultInput> = {}): BuildResultInput {
  return {
    task: 'Build a photo gallery app and deploy it to Vercel',
    currentTool: 'Gemini',
    overrideEnabled: true,
    hybridEnabled: true,
    priority: 'balance',
    corrections: {},
    ...overrides,
  }
}

describe('scoreRoute', () => {
  it('ranks execution first for build-heavy tasks', () => {
    const ranked = scoreRoute('build an app with code and a frontend', 'balance', {})
    expect(ranked[0].key).toBe('execution')
    expect(ranked[0].score).toBeGreaterThan(0)
  })

  it('applies learned corrections to the score', () => {
    const base = scoreRoute('organize workshop notes', 'balance', {})
    const corrected = scoreRoute('organize workshop notes', 'balance', {
      workshop: { documentation: 6 },
    })
    const baseDoc = base.find(r => r.key === 'documentation')!.score
    const correctedDoc = corrected.find(r => r.key === 'documentation')!.score
    expect(correctedDoc).toBeGreaterThan(baseDoc)
  })
})

describe('buildResult (doctrine fallback)', () => {
  it('always produces at least one prompt and marks the source', () => {
    const result = buildResult(input())
    expect(result.prompts.length).toBeGreaterThanOrEqual(1)
    expect(result.primaryRoute).toBeTruthy()
    expect(result.source).toBe('doctrine')
  })

  it('assigns every result a task id', () => {
    const result = buildResult(input())
    expect(result.id).toMatch(/^T-/)
  })

  it('routes to architecture when nothing matches', () => {
    const result = buildResult(input({ task: 'zzzz qqqq', overrideEnabled: false }))
    expect(result.primaryKey).toBe('architecture')
  })
})

describe('parseAiDecision', () => {
  it('accepts a valid decision', () => {
    const decision = parseAiDecision({
      routes: [{ key: 'execution', reason: 'Build-heavy task.' }],
      override: { active: false, reason: 'No friction.' },
      strength: 85,
    })
    expect(decision).not.toBeNull()
    expect(decision!.routes[0].key).toBe('execution')
    expect(decision!.strength).toBe(85)
  })

  it('drops invalid route keys and dedupes', () => {
    const decision = parseAiDecision({
      routes: [
        { key: 'nonsense', reason: 'x' },
        { key: 'research', reason: 'a' },
        { key: 'research', reason: 'b' },
        { key: 'execution', reason: 'c' },
        { key: 'deployment', reason: 'd' },
      ],
      override: { active: false, reason: '' },
      strength: 50,
    })
    expect(decision!.routes.map(r => r.key)).toEqual(['research', 'execution'])
  })

  it('clamps strength into 0-100 and defaults when missing', () => {
    expect(
      parseAiDecision({
        routes: [{ key: 'execution', reason: '' }],
        strength: 400,
      })!.strength,
    ).toBe(100)
    expect(
      parseAiDecision({
        routes: [{ key: 'execution', reason: '' }],
      })!.strength,
    ).toBe(60)
  })

  it('returns null for garbage', () => {
    expect(parseAiDecision(null)).toBeNull()
    expect(parseAiDecision('text')).toBeNull()
    expect(parseAiDecision({ routes: [] })).toBeNull()
    expect(parseAiDecision({ routes: [{ key: 'bogus' }] })).toBeNull()
  })
})

describe('buildResultFromDecision', () => {
  it('builds a single-route result from an AI decision', () => {
    const result = buildResultFromDecision(
      input(),
      {
        routes: [{ key: 'deployment', reason: 'Shipping to Vercel.' }],
        override: { active: false, reason: '' },
        strength: 90,
      },
      'Claude',
    )
    expect(result.primaryRoute).toBe('Vercel + GitHub')
    expect(result.mode).toBe('Single route')
    expect(result.strength).toBe(90)
    expect(result.source).toBe('Claude')
    expect(result.prompts[0].prompt).toContain('Deployment operator')
  })

  it('records the deciding model when provided', () => {
    const result = buildResultFromDecision(
      input(),
      {
        routes: [{ key: 'execution', reason: '' }],
        override: { active: false, reason: '' },
        strength: 80,
      },
      'Claude',
      'claude-sonnet-4-6',
    )
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.id).toMatch(/^T-/)
  })

  it('builds a hybrid result when the AI returns two routes', () => {
    const result = buildResultFromDecision(
      input(),
      {
        routes: [
          { key: 'research', reason: 'Verify facts first.' },
          { key: 'execution', reason: 'Then build.' },
        ],
        override: { active: false, reason: '' },
        strength: 70,
      },
      'GPT',
    )
    expect(result.mode).toBe('Hybrid')
    expect(result.prompts).toHaveLength(2)
    expect(result.prompts[0].part).toBe('Part A')
  })

  it('respects hybridEnabled=false by keeping one route', () => {
    const result = buildResultFromDecision(
      input({ hybridEnabled: false }),
      {
        routes: [
          { key: 'research', reason: '' },
          { key: 'execution', reason: '' },
        ],
        override: { active: false, reason: '' },
        strength: 70,
      },
      'Claude',
    )
    expect(result.prompts).toHaveLength(1)
  })

  it('puts the current tool first when the AI activates the override', () => {
    const result = buildResultFromDecision(
      input({ currentTool: 'Claude / ChatGPT' }),
      {
        routes: [{ key: 'execution', reason: 'Build it.' }],
        override: { active: true, reason: 'Already deep in context.' },
        strength: 65,
      },
      'Claude',
    )
    expect(result.primaryRoute).toBe('Claude / ChatGPT')
    expect(result.override.active).toBe(true)
  })

  it('ignores the AI override when the user disabled overrides', () => {
    const result = buildResultFromDecision(
      input({ overrideEnabled: false }),
      {
        routes: [{ key: 'execution', reason: '' }],
        override: { active: true, reason: 'Stay put.' },
        strength: 65,
      },
      'Claude',
    )
    expect(result.override.active).toBe(false)
    expect(result.primaryRoute).toBe('Gemini')
  })
})

describe('correctionHints (feeds Teach-router learning to AI routing)', () => {
  it('returns nothing when no corrections apply to the wording', () => {
    expect(correctionHints('Build a photo gallery', {})).toEqual([])
    expect(
      correctionHints('Build a photo gallery', {
        unrelated: { documentation: 4 },
      }),
    ).toEqual([])
  })

  it('sums weights across matching tokens, sorted by weight', () => {
    const hints = correctionHints('Build a photo gallery app', {
      gallery: { documentation: 4, research: 1 },
      photo: { documentation: 2 },
    })
    expect(hints[0]).toEqual({ key: 'documentation', weight: 6 })
    expect(hints[1]).toEqual({ key: 'research', weight: 1 })
  })

  it('caps the number of hints at 4', () => {
    const hints = correctionHints('Build a photo gallery app', {
      gallery: {
        documentation: 5,
        research: 4,
        deployment: 3,
        architecture: 2,
        system_state: 1,
      },
    })
    expect(hints).toHaveLength(4)
  })
})

describe('applyCorrection', () => {
  it('boosts the corrected route for the task tokens', () => {
    const next = applyCorrection(
      'organize workshop notes',
      'architecture',
      'documentation',
      {},
    )
    expect(next.workshop?.documentation).toBe(2)
  })

  it('is a no-op when from and to match', () => {
    const before = { workshop: { documentation: 2 } }
    expect(applyCorrection('workshop', 'documentation', 'documentation', before)).toBe(
      before,
    )
  })
})
