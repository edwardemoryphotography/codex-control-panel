'use client';
import { useState } from 'react';

const ARTIFACT_TERMS = ['file', 'repo', 'commit', 'deploy', 'url', 'dashboard', 'html', 'markdown', 'doc', 'publish', 'ship', 'build', 'export'];
const MINDSET_TERMS = ['motivation', 'mindset', 'habit', 'feel', 'inspiration', 'confidence', 'affirmation'];

export default function SprintLinkerTab() {
  const [task, setTask] = useState('');
  const [principle, setPrinciple] = useState('Artifact Anchoring');
  const [result, setResult] = useState<{ type: 'linked' | 'orphaned'; reason: string } | null>(null);

  function validate() {
    if (!task.trim()) {
      setResult({ type: 'orphaned', reason: 'Task is empty.' });
      return;
    }
    const lower = task.toLowerCase();
    const hasArtifact = ARTIFACT_TERMS.some(t => lower.includes(t));
    const hasMindset = MINDSET_TERMS.some(t => lower.includes(t));
    if (hasArtifact && !hasMindset) {
      setResult({ type: 'linked', reason: `Artifact/system language detected. No mindset-only language. Principle: ${principle}.` });
    } else if (!hasArtifact) {
      setResult({ type: 'orphaned', reason: 'No artifact/system language detected (file, repo, commit, deploy, url, dashboard, html, markdown, doc, publish, ship, build, export).' });
    } else {
      setResult({ type: 'orphaned', reason: 'Mindset-only language detected.' });
    }
  }

  return (
    <div>
      <h2 style={sectionTitle}>Sprint Linker</h2>
      <p style={sectionSub}>Validate whether a sprint statement is anchored to artifact/system reality.</p>

      <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
        <label style={fieldLabel}>Describe your current task in one sentence</label>
        <input type="text" value={task} onChange={e => setTask(e.target.value)} placeholder="Example: Commit index.html and publish to GitHub Pages" />
      </div>

      <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
        <label style={fieldLabel}>Link to Canonical Principle</label>
        <select value={principle} onChange={e => setPrinciple(e.target.value)}>
          {['Artifact Anchoring', 'Interruption Resilience', 'Governing Law', 'Constraint Discipline'].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <button onClick={validate} style={actionBtn}>Validate Sprint</button>

      {result && (
        <div style={{
          marginTop: '12px',
          border: `1px solid var(--${result.type === 'linked' ? 'success' : 'error'})`,
          borderRadius: 'var(--radius)',
          background: `var(--${result.type === 'linked' ? 'success' : 'error'}-soft)`,
          padding: '12px',
          color: result.type === 'linked' ? '#bff5d8' : '#ffc8cf',
          minHeight: '58px',
        }}>
          <strong>{result.type === 'linked' ? 'LINKED' : 'ORPHANED'}</strong><br />
          Reason: {result.reason}
        </div>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
const fieldLabel: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' };
const actionBtn: React.CSSProperties = { border: '1px solid var(--teal)', borderRadius: '10px', background: 'var(--teal-soft)', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', minHeight: '44px', padding: '10px 14px' };
