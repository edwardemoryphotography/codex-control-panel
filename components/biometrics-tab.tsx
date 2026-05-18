'use client';
import { useState, useEffect, useRef } from 'react';

interface DayRecord {
  date: string;
  sleepHours: number;
  recoveryScore: number;
  focusScore: number;
}

interface Summary {
  readiness: number;
  recovery: number;
  focus: number;
  sleepDebt: number;
  mode: string;
  recommendation: string;
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, Math.round(v))); }
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function summarize(days: DayRecord[]): Summary {
  const recent = days.slice(-7);
  const recovery = avg(recent.map(d => d.recoveryScore));
  const focus = avg(recent.map(d => d.focusScore));
  const sleep = avg(recent.map(d => d.sleepHours));
  const readiness = clamp(recovery * 0.48 + focus * 0.32 + Math.min(100, sleep * 12) * 0.2, 0, 100);
  const sleepDebt = Math.round(Math.max(0, 7.7 - sleep) * 70) / 10;
  let mode = 'deep_build';
  let recommendation = 'Deep-build lane: architecture, implementation, and launch work are appropriate.';
  if (readiness < 42 || sleep < 6) {
    mode = 'recovery'; recommendation = 'Recovery lane: capture ideas, avoid irreversible architecture, protect sleep.';
  } else if (readiness < 58) {
    mode = 'admin_light'; recommendation = 'Admin-light lane: triage, docs, small deploy checks, no scope expansion.';
  } else if (focus > recovery + 12) {
    mode = 'creative_edit'; recommendation = 'Creative edit lane: shape assets and workshop material, avoid heavy refactors.';
  }
  return { readiness, recovery: clamp(recovery, 0, 100), focus: clamp(focus, 0, 100), sleepDebt, mode, recommendation };
}

export default function BiometricsTab() {
  const [state, setState] = useState<{ days: DayRecord[]; source: string; error: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const TREND_URL = '/notes/biometric-trends.json';

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(TREND_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      if (!raw.trim()) throw new Error('File is empty.');
      const parsed = JSON.parse(raw);
      const candidate: DayRecord[] = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.days) ? parsed.days : []);
      const days = candidate.filter(d =>
        d && typeof d.date === 'string' &&
        isFinite(Number(d.sleepHours)) && isFinite(Number(d.recoveryScore)) && isFinite(Number(d.focusScore))
      ).slice(-30);
      if (!days.length) throw new Error('No valid day records.');
      setState({ days, source: parsed.source ?? 'live bridge', error: '' });
    } catch (e: unknown) {
      setState({ days: [], source: '', error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const summary = state?.days.length ? summarize(state.days) : null;

  const kpis = summary
    ? [['Recovery', `${summary.recovery}%`], ['Focus', `${summary.focus}%`], ['Sleep debt', `${summary.sleepDebt}h`], ['Window', '30d']]
    : [['Recovery', '—'], ['Focus', '—'], ['Sleep debt', '—'], ['Window', '30d']];

  return (
    <div>
      <h2 style={sectionTitle}>Biometric Governor</h2>
      <p style={sectionSub}>WHOOP recovery, Apple Health sleep, and Muse mindful minutes become execution constraints.</p>

      <article style={{
        display: 'grid',
        gap: '16px',
        border: '1px solid rgba(0, 212, 170, 0.28)',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at top left, rgba(0,212,170,0.16), transparent 34%), linear-gradient(180deg, var(--surface-soft), var(--surface))',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: '34px', borderRadius: '999px', padding: '6px 10px', border: '1px solid var(--teal)', color: 'var(--teal)', background: 'var(--teal-soft)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {summary ? summary.mode.replace('_', ' ') : '—'}
            </span>
            <span style={{ border: '1px solid var(--line-strong)', borderRadius: '999px', fontSize: '0.78rem', color: 'var(--text-soft)', padding: '6px 10px', background: 'var(--surface-soft)' }}>
              source: {state?.source || 'awaiting live bridge'}
            </span>
          </div>
          <div style={{ fontSize: 'clamp(2.4rem, 13vw, 4.8rem)', lineHeight: 0.95, fontWeight: 800, letterSpacing: '-0.06em', color: 'var(--text)', margin: '8px 0' }}>
            {summary ? summary.readiness : '—'}
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', lineHeight: 1.55 }}>
            {summary ? summary.recommendation : 'Biometric data required. Connect a live bridge (WHOOP / Muse / Apple Health) that writes real values to notes/biometric-trends.json. No mock or sample data will be shown.'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {kpis.map(([label, value]) => (
            <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'rgba(10,10,15,0.32)', padding: '12px' }}>
              <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</span>
              <strong style={{ display: 'block', fontSize: '1.25rem' }}>{value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontWeight: 700 }}>Trend overlay</h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: '4px' }}>Recovery, focus, and sleep trend lines from live bridge output.</p>
          </div>
          <button onClick={load} disabled={loading} style={{ border: '1px solid var(--teal)', borderRadius: '10px', background: 'var(--teal-soft)', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', minHeight: '44px', padding: '10px 14px' }}>
            {loading ? 'Loading…' : 'Reload live data'}
          </button>
        </div>
        <svg ref={svgRef} viewBox="0 0 720 220" style={{ width: '100%', height: '220px', overflow: 'visible' }} role="img" aria-label="30-day biometric trend chart">
          {state?.days.length ? (
            [['recoveryScore', 'var(--success)', 100], ['focusScore', 'var(--teal)', 100], ['sleepHours', 'var(--amber)', 10]].map(([key, color, maxV]) => {
              const values = state.days.map(d => Number(d[key as keyof DayRecord]));
              const step = 720 / Math.max(1, values.length - 1);
              const pts = values.map((v, i) => {
                const x = step * i;
                const y = 18 + 180 - (v / Number(maxV)) * 180;
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${Math.max(18, Math.min(198, y)).toFixed(1)}`;
              }).join(' ');
              return <path key={String(key)} d={pts} fill="none" stroke={String(color)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
            })
          ) : (
            <text x="360" y="110" textAnchor="middle" fill="var(--text-dim)" fontSize="14">No live data</text>
          )}
        </svg>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: '12px' }}>
          {state?.error ? `Could not load data: ${state.error}` : state?.days.length ? `Live data: ${state.days.length} day record(s) loaded.` : 'No live biometric data loaded.'}
        </p>
      </article>

      <article style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--amber)' }}>Operating rule</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
          {summary ? `${summary.recommendation} This should inform task ranking before prompts are sent to build agents.` : 'No live biometric data. The governor is abstaining — no readiness score, no lane recommendation.'}
        </p>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: '12px' }}>
          Live bridge target: write normalized metrics to <code>notes/biometric-trends.json</code>. This dashboard has no mock, fixture, sample, or fallback values.
        </p>
      </article>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
