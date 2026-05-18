'use client';
import { useState, useEffect } from 'react';

const PROTOCOLS = [
  { title: '1. The Smallest Ship', trigger: 'Ambiguity detected', output: 'Smallest shippable artifact' },
  { title: '2. Pre-Friction Triage', trigger: 'Execution stall >15m', output: 'Identification of 1 blocker' },
  { title: '3. Constraint Decay', trigger: 'Blocker >48 hours', output: 'Automatic purge or 180-pivot' },
  { title: '4. Tech Stack Mandate', trigger: 'New tool proposed', output: 'Reject unless Sony/Apple/Muse/Docker' },
  {
    title: '5. Failure Validation',
    trigger: 'Edward says "doesn\'t work"',
    output: '5-step debug checklist: (1) Artifact defined? (2) Blocker named? (3) Tool or constraint failure? (4) Smallest reproducible test? (5) 180-pivot if unfixable in 15min?',
  },
];

const DEFICITS = [
  { status: 'resolved', text: 'System Persistence → Public URL live' },
  { status: 'fail', text: 'Version History → v1-v16 unrecovered' },
  { status: 'open', text: 'Tab count discrepancy → under investigation' },
];

const TAG_COLORS: Record<string, string> = {
  resolved: 'var(--success)',
  fail: 'var(--error)',
  open: 'var(--amber)',
};

const DEPLOY_KEY = 'codex_v17_deploy_status';

export default function ProtocolsTab() {
  const [localFile, setLocalFile] = useState('YES — index.html committed to GitHub');
  const [repo, setRepo] = useState('https://github.com/edwardemoryphotography/legacy-codex');
  const [url, setUrl] = useState('https://edwardemoryphotography.github.io/legacy-codex/');
  const [exportDate, setExportDate] = useState('2026-02-17');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEPLOY_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.localFile) setLocalFile(p.localFile);
        if (p.repo) setRepo(p.repo);
        if (p.url) setUrl(p.url);
        if (p.exported) setExportDate(p.exported);
        if (p.savedAt) setSavedAt(p.savedAt);
      }
    } catch {}
  }, []);

  function save() {
    const ts = new Date().toLocaleString();
    try {
      localStorage.setItem(DEPLOY_KEY, JSON.stringify({ localFile, repo, url, exported: exportDate, savedAt: ts }));
      setSavedAt(ts);
    } catch {}
  }

  return (
    <div>
      <h2 style={sectionTitle}>Protocols</h2>
      <p style={sectionSub}>Operational cards — expand to inspect trigger/output pairs.</p>

      {PROTOCOLS.map(p => (
        <details key={p.title} style={{
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
          marginBottom: '8px',
          overflow: 'hidden',
        }}>
          <summary style={{
            listStyle: 'none',
            cursor: 'pointer',
            padding: '16px',
            fontWeight: 700,
            color: 'var(--amber)',
            background: 'linear-gradient(180deg, #1b1b29, #161623)',
          }}>{p.title}</summary>
          <div style={{ padding: '16px', color: 'var(--text-soft)', fontSize: '0.9rem', display: 'grid', gap: '6px' }}>
            <div><strong style={{ color: 'var(--text)' }}>Trigger:</strong> {p.trigger}</div>
            <div><strong style={{ color: 'var(--text)' }}>Output:</strong> {p.output}</div>
          </div>
        </details>
      ))}

      <article style={{ ...card, marginTop: '16px' }}>
        <h3 style={{ ...cardTitle }}>Convergence Event</h3>
        <p><strong>Map→Territory Collapse — 2025-11-30</strong></p>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: '4px' }}>"The irreversible shift from planning how to work to the work being the system."</p>
      </article>

      <article style={{ ...card, marginTop: '12px' }}>
        <h3 style={cardTitle}>Deployment Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', margin: '12px 0' }}>
          {[
            { label: 'Local file saved', value: localFile, set: setLocalFile, type: 'text' },
            { label: 'GitHub repo', value: repo, set: setRepo, type: 'url' },
            { label: 'Public URL', value: url, set: setUrl, type: 'url' },
            { label: 'Last exported', value: exportDate, set: setExportDate, type: 'date' },
          ].map(f => (
            <div key={f.label} style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={save} style={actionBtn}>Save</button>
        <div style={{ marginTop: '8px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
          Status fields reflect user-declared state. Last saved: {savedAt ?? 'never saved'}
        </div>
      </article>

      <article style={{ ...card, marginTop: '12px' }}>
        <h3 style={cardTitle}>Open Deficits</h3>
        <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
          {DEFICITS.map(d => (
            <div key={d.text} style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              background: 'var(--surface-soft)',
              padding: '10px 12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: 'var(--text-soft)',
            }}>
              <span style={{
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '999px',
                border: `1px solid ${TAG_COLORS[d.status]}`,
                color: TAG_COLORS[d.status],
                background: `${TAG_COLORS[d.status]}22`,
                textTransform: 'uppercase',
              }}>{d.status}</span>
              {d.text}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
const card: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '16px', marginBottom: '8px' };
const cardTitle: React.CSSProperties = { fontSize: '0.95rem', marginBottom: '8px', color: 'var(--amber)' };
const actionBtn: React.CSSProperties = { border: '1px solid var(--teal)', borderRadius: '10px', background: 'var(--teal-soft)', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', minHeight: '44px', padding: '10px 14px' };
