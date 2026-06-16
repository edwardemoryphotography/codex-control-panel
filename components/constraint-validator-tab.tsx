'use client';
import { useState } from 'react';

const CHECKS = [
  {
    name: 'Artifact Anchoring',
    pass: (t: string) => ['file','repo','commit','deploy','url','dashboard','html','markdown','doc','publish','ship','build','export','artifact'].some(w => t.includes(w)),
    passReason: 'Concrete artifact/system language is present.',
    failReason: 'No concrete artifact or system deliverable is named.',
  },
  {
    name: 'Interruption Resilience',
    pass: (t: string) => ['resumption','resume','next action','blocker','checkpoint','log','transcript','handoff','stateless','continue'].some(w => t.includes(w)),
    passReason: 'Resumption continuity cues are present.',
    failReason: 'No interruption-safe resumption cue is present.',
  },
  {
    name: 'Governing Law',
    pass: (t: string) => ['system','authority','protocol','constraint','rule','policy','checklist','validate'].some(w => t.includes(w)),
    passReason: 'Task references system/protocol/constraint authority.',
    failReason: 'Task does not reference system authority constraints.',
  },
  {
    name: 'Constraint Discipline',
    pass: (t: string) => ['existing','current','reuse','modify','simplify','remove','prune','within this repo'].some(w => t.includes(w)) && !['new tool','new stack','new framework','switch to','rewrite in','start over'].some(w => t.includes(w)),
    passReason: 'Task favors modifying existing infrastructure.',
    failReason: 'Task does not clearly prefer existing infrastructure.',
  },
];

export default function ConstraintValidatorTab() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{ name: string; pass: boolean; reason: string }[]>([]);
  const [verdict, setVerdict] = useState<'aligned' | 'violation' | null>(null);

  function validate() {
    if (!input.trim()) { setResults([]); setVerdict('violation'); return; }
    const lower = input.toLowerCase();
    const evals = CHECKS.map(c => ({ name: c.name, pass: c.pass(lower), reason: c.pass(lower) ? c.passReason : c.failReason }));
    setResults(evals);
    setVerdict(evals.every(e => e.pass) ? 'aligned' : 'violation');
  }

  return (
    <div>
      <h2 style={sectionTitle}>Constraint Validator</h2>
      <p style={sectionSub}>Run a task against all 4 Canonical Principles with pass/fail reasoning.</p>

      <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
        <label style={fieldLabel}>Paste any task, idea, or prompt here</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste task text for validation." />
      </div>

      <button onClick={validate} style={actionBtn}>Validate Against Codex</button>

      {results.length > 0 && (
        <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
          {results.map(r => (
            <div key={r.name} style={{
              borderRadius: '10px',
              border: `1px solid var(--${r.pass ? 'success' : 'error'})`,
              background: `var(--${r.pass ? 'success' : 'error'}-soft)`,
              padding: '10px 12px',
              fontSize: '0.88rem',
              color: r.pass ? '#c4f7de' : '#ffd0d5',
              display: 'grid',
              gap: '4px',
            }}>
              <strong>{r.name}: {r.pass ? 'PASS ✓' : 'FAIL ✗'}</strong>
              <span>{r.reason}</span>
            </div>
          ))}
        </div>
      )}

      {verdict && (
        <div style={{
          marginTop: '12px',
          border: `1px solid var(--${verdict === 'aligned' ? 'success' : 'error'})`,
          borderRadius: '10px',
          padding: '10px 12px',
          fontWeight: 800,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          fontSize: '0.83rem',
          color: `var(--${verdict === 'aligned' ? 'success' : 'error'})`,
          background: `var(--${verdict === 'aligned' ? 'success' : 'error'}-soft)`,
        }}>{verdict === 'aligned' ? 'CODEX-ALIGNED' : 'CODEX-VIOLATION'}</div>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
const fieldLabel: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' };
const actionBtn: React.CSSProperties = { border: '1px solid var(--teal)', borderRadius: '10px', background: 'var(--teal-soft)', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', minHeight: '44px', padding: '10px 14px' };
