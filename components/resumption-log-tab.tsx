'use client';
import { useState } from 'react';

export default function ResumptionLogTab() {
  const [artifact, setArtifact] = useState('');
  const [action, setAction] = useState('');
  const [blocker, setBlocker] = useState('');
  const [log, setLog] = useState('');
  const [copyStatus, setCopyStatus] = useState('Clipboard status: not copied yet.');

  function generate() {
    const ts = new Date().toLocaleString();
    const text = [
      `## Resumption Log — ${ts}`,
      `- Last artifact: ${artifact.trim() || 'not specified'}`,
      `- Next action: ${action.trim() || 'not specified'}`,
      `- Blocker: ${blocker.trim() || 'not specified'}`,
    ].join('\n');
    setLog(text);
  }

  async function copy() {
    if (!log) { setCopyStatus('Clipboard status: no log text yet.'); return; }
    if (!navigator.clipboard) {
      setCopyStatus('Clipboard status: clipboard API not available in this context.');
      return;
    }
    try {
      await navigator.clipboard.writeText(log);
      setCopyStatus('Clipboard status: copied successfully.');
    } catch {
      setCopyStatus('Clipboard status: copy failed.');
    }
  }

  return (
    <div>
      <h2 style={sectionTitle}>Resumption Log</h2>
      <p style={sectionSub}>Capture immediate continuity data for interruption-safe restart.</p>

      {[
        { label: 'What was the last artifact produced?', value: artifact, set: setArtifact, placeholder: 'index.html update, deployment commit, transcript link' },
        { label: 'What is the next single action?', value: action, set: setAction, placeholder: 'Run local smoke check and push main' },
        { label: 'What is the blocker, if any?', value: blocker, set: setBlocker, placeholder: 'If none, write none' },
      ].map(f => (
        <div key={f.label} style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
          <label style={fieldLabel}>{f.label}</label>
          <input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
        </div>
      ))}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        <button onClick={generate} style={actionBtn}>Generate Log Entry</button>
        <button onClick={copy} style={{ ...actionBtn, background: 'var(--teal-soft)' }}>Copy to Clipboard</button>
      </div>

      <div style={{ marginTop: '8px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>{copyStatus}</div>

      {log && (
        <pre style={{
          marginTop: '12px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          background: '#0f0f18',
          padding: '12px',
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          minHeight: '140px',
          fontSize: '0.9rem',
        }}>{log}</pre>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
const fieldLabel: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' };
const actionBtn: React.CSSProperties = { border: '1px solid var(--teal)', borderRadius: '10px', background: 'var(--teal-soft)', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', minHeight: '44px', padding: '10px 14px' };
