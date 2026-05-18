'use client';
import { useState, useEffect } from 'react';

type MetricValue = 'PASS' | 'FAIL' | null;
interface Metrics {
  artifact_existence: MetricValue;
  stateless_resumption: MetricValue;
  subtraction_check: MetricValue;
}

const DEFAULTS: Metrics = {
  artifact_existence: 'PASS',
  stateless_resumption: 'PASS',
  subtraction_check: 'PASS',
};

const PRINCIPLES = [
  { title: '1. Artifact Anchoring', body: 'Every interaction must yield a tangible system change or file.' },
  { title: '2. Interruption Resilience', body: 'Systems must be stateless enough to survive pauses.' },
  { title: '3. Governing Law', body: 'The system is the authority, not the user's fluctuating energy.' },
  { title: '4. Constraint Discipline', body: 'Prefer modifying existing infrastructure over proposing new tools.' },
];

const METRIC_ITEMS = [
  { key: 'artifact_existence' as keyof Metrics, label: 'Artifact Existence — Does a thing exist post-turn?' },
  { key: 'stateless_resumption' as keyof Metrics, label: 'Stateless Resumption — Can Edward resume from a transcript link?' },
  { key: 'subtraction_check' as keyof Metrics, label: 'Subtraction Check — Did this turn remove or simplify a step?' },
];

export default function OverviewTab() {
  const [metrics, setMetrics] = useState<Metrics>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('codex_v17_metrics');
      if (stored) setMetrics({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function toggle(key: keyof Metrics, value: MetricValue) {
    const next = { ...metrics, [key]: value };
    setMetrics(next);
    try { localStorage.setItem('codex_v17_metrics', JSON.stringify(next)); } catch {}
  }

  return (
    <div>
      <h2 style={sectionTitle}>Canonical Principles</h2>
      <p style={sectionSub}>Core authority constraints that govern execution quality.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {PRINCIPLES.map(p => (
          <article key={p.title} style={card}>
            <h3 style={{ color: 'var(--teal)', marginBottom: '6px', fontSize: '0.97rem' }}>{p.title}</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{p.body}</p>
          </article>
        ))}
      </div>

      <h2 style={sectionTitle}>Validation Metrics</h2>
      <p style={sectionSub}>Mark each metric PASS or FAIL. Values persist locally on this device.</p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {METRIC_ITEMS.map(({ key, label }) => (
          <div key={key} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['PASS', 'FAIL'] as MetricValue[]).map(v => (
                <button
                  key={v}
                  onClick={() => toggle(key, v)}
                  style={{
                    border: metrics[key] === v
                      ? `1px solid var(--${v === 'PASS' ? 'success' : 'error'})`
                      : '1px solid var(--line-strong)',
                    background: metrics[key] === v
                      ? `var(--${v === 'PASS' ? 'success' : 'error'}-soft)`
                      : 'var(--surface-soft)',
                    color: metrics[key] === v
                      ? `var(--${v === 'PASS' ? 'success' : 'error'})`
                      : 'var(--text-soft)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    minWidth: '72px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: '0.18s',
                  }}
                >{v}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', marginTop: '4px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
const card: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--surface-soft), var(--surface))',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  padding: '16px',
};
