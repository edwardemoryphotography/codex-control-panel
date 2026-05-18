'use client';
import { useState } from 'react';

const SECTIONS = [
  {
    id: 'root',
    title: 'Root — Identity & Operating Principles',
    color: 'var(--teal)',
    entries: [
      { label: 'System Identity', content: 'Edward Emory Photography personal operating system. v17 OPERATIONAL. Reality Filter Active — no mock data, no placeholders, no invented state.' },
      { label: 'Territory Mode', content: 'Single-file mode proven. Upgrade path: Next.js hosted on Vercel via codex-control-panel. GitHub: edwardemoryphotography.' },
      { label: 'Reality Filter', content: 'Every output must be verifiable. No simulation, no sample data, no fabricated biometrics. The system abstains rather than guesses.' },
      { label: 'Version History', content: 'v17 current and operational. v1-v16 unrecovered. Convergence event logged 2025-11-30.' },
    ],
  },
  {
    id: 'council',
    title: 'Council — Role System',
    color: 'var(--amber)',
    entries: [
      { label: 'The Architect', content: 'Designs system structure, sets constraints, evaluates tool proposals against the Tech Stack Mandate. Authority: Sony/Apple/Muse/Docker only.' },
      { label: 'The Executor', content: 'Produces artifacts, ships code, triggers deployments. Operates under Artifact Anchoring — every turn yields a tangible system change.' },
      { label: 'The Guardian', content: 'Enforces protocol compliance, gates quality, triggers Failure Validation when Edward says "doesn\'t work". Runs the 5-step debug checklist.' },
      { label: 'Weekly Protocol', content: 'Review all open deficits. Run constraint validator on top 3 active tasks. Update Resumption Log before session close.' },
    ],
  },
  {
    id: 'territory',
    title: 'Territory — Ledger & Boot Sequence',
    color: 'var(--teal)',
    entries: [
      { label: 'Boot Sequence', content: '1. Load Canonical Principles → 2. Check Validation Metrics → 3. Review open Protocols → 4. Confirm Deployment Status → 5. Resume last artifact.' },
      { label: 'Current Ledger', content: 'Repo: edwardemoryphotography/legacy-codex (GitHub Pages). Control Panel: edwardemoryphotography/codex-control-panel (Vercel). Foundry Console: Supabase-backed ops dashboard.' },
      { label: 'Open Deficits', content: 'RESOLVED: system persistence. FAIL: v1-v16 version history unrecovered. OPEN: tab count discrepancy under investigation.' },
    ],
  },
  {
    id: 'artistic',
    title: 'Artistic Systems',
    color: 'var(--amber)',
    entries: [
      { label: 'Astro Operations', content: 'Night sky photography pipeline. Capture → LRC processing → export → delivery. Tools: Sony A7 series, Photoshop, Lightroom.' },
      { label: 'Timelapse Operations', content: 'Long-form capture workflow. Interval scheduling, storage management, final render pipeline. Frame rate targets defined per project.' },
      { label: 'Landscapes', content: 'Composition system, RAW processing protocol, output sizing for print tiers. Reality filter: no AI-generated or composite landscapes.' },
      { label: 'Photo Coach MVP', content: 'Client-facing coaching product. 1:1 sessions, curriculum, delivery format. Revenue stream separate from print sales.' },
      { label: '6-Figure Print Engine', content: 'Three-tier model: Tier 1 $150 (open editions), Tier 2 $800-$2K (limited editions), Tier 3 $5K+ (large format originals). Annual print target: $100K.' },
    ],
  },
  {
    id: 'neuro',
    title: 'Neuro — EEG & Bio Geometry',
    color: 'var(--teal)',
    entries: [
      { label: 'EEG Systems', content: 'Muse headband-based focus measurement. Mindful minutes logged and fed into biometric bridge as focusScore. Minimum threshold for deep-build lane: 60 mindful minutes/week.' },
      { label: 'Bio Geometry Engine', content: 'Biometric state (WHOOP recovery + Muse focus + Apple Health sleep) maps to execution lanes: deep_build, creative_edit, admin_light, recovery.' },
      { label: 'Lane Definitions', content: 'deep_build ≥58 readiness: architecture and launch work. creative_edit: focus>recovery+12. admin_light 42-58: triage/docs only. recovery <42 or sleep<6h: protect rest, no irreversible changes.' },
    ],
  },
  {
    id: 'automation',
    title: 'Automation — Pipelines & RAG',
    color: 'var(--amber)',
    entries: [
      { label: 'File Processing Pipeline', content: 'Ingest → rename → backup → process → export → deliver. Trigger: new session import. Output: structured folder with LRC sidecar and delivery-ready export.' },
      { label: 'RAG Photography System', content: 'Retrieval-augmented generation for photo research. Knowledge base: gear specs, technique library, client brief history. Query interface via constraint validator.' },
      { label: 'Backup Protocol', content: 'Three-copy rule: local SSD, NAS, cloud. Trigger: end of every shoot. No cloud upload without local verification first.' },
    ],
  },
  {
    id: 'business',
    title: 'Business — Money OS',
    color: 'var(--teal)',
    entries: [
      { label: 'Drop Model', content: 'Limited edition print releases. Max 25 units per drop. Drop cadence: monthly. Announcement: 48h ahead. Sell-through tracked in ledger.' },
      { label: 'Workshop Engines', content: 'Educational product pipeline. Formats: 1-day intensive, 4-week cohort, self-paced digital. Workshop revenue target: $137K annually.' },
      { label: 'Money OS', content: 'Print revenue target: $100K/year. Workshop revenue target: $137K/year. Combined: $237K. Tracker updated monthly. No vanity metrics — only realized revenue.' },
      { label: 'Pricing Authority', content: 'Tier 1 $150, Tier 2 $800-$2K, Tier 3 $5K+. No discounting on Tier 2/3. Workshop rates: 1-day $450/person, 4-week $1,200/person, digital $297.' },
    ],
  },
  {
    id: 'personal-os',
    title: 'Personal OS — Personality & Neurodivergent Manual',
    color: 'var(--amber)',
    entries: [
      { label: 'Personality Manual', content: 'Operating modes: Deep Work (4h blocks, no interrupts), Surface Work (admin, email, scheduling), Creative Play (no output pressure). Transitions require 15min buffer.' },
      { label: 'Neurodivergent OS', content: 'ADHD/autism-aware workflow design. Task switching cost: 20-30 min. Context-switching mitigated by Resumption Log. Hyper-focus windows scheduled, not wasted.' },
      { label: 'Energy Management', content: 'Morning: deep build only. Afternoon: creative or admin. Evening: review and log only — no new commitments. Biometric Governor informs daily lane assignment.' },
    ],
  },
  {
    id: 'convergence',
    title: 'Convergence — System Reflexivity',
    color: 'var(--teal)',
    entries: [
      { label: 'Convergence Event 2025-11-30', content: 'Map→Territory Collapse. The irreversible shift from planning how to work to the work being the system. Dashboard IS the operating system.' },
      { label: 'System Reflexivity', content: 'The codex documents itself. Each update to the dashboard is an update to the operating system. Version bumps are operational events, not administrative ones.' },
      { label: 'Convergence Logs', content: 'Log format: date | event | system impact | artifact produced. Minimum: one log entry per major system change. Stored in logs/ directory of legacy-codex repo.' },
    ],
  },
];

export default function CodexTab() {
  const [open, setOpen] = useState<string | null>('root');

  return (
    <div>
      <h2 style={sectionTitle}>Codex — Knowledge Graph</h2>
      <p style={sectionSub}>9-section system map. Expand each section to inspect entries.</p>

      {SECTIONS.map(section => (
        <div key={section.id} style={{ marginBottom: '8px' }}>
          <button
            onClick={() => setOpen(open === section.id ? null : section.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 16px',
              border: '1px solid var(--line)',
              borderRadius: open === section.id ? 'var(--radius) var(--radius) 0 0' : 'var(--radius)',
              background: 'linear-gradient(180deg, #1b1b29, #161623)',
              color: section.color,
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{section.title}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{open === section.id ? '▲' : '▼'}</span>
          </button>

          {open === section.id && (
            <div style={{
              border: '1px solid var(--line)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius) var(--radius)',
              background: 'var(--surface)',
              padding: '16px',
              display: 'grid',
              gap: '12px',
            }}>
              {section.entries.map(entry => (
                <div key={entry.label} style={{
                  borderLeft: `3px solid ${section.color}`,
                  paddingLeft: '12px',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '4px' }}>{entry.label}</div>
                  <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem', lineHeight: 1.6 }}>{entry.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' };
const sectionSub: React.CSSProperties = { color: 'var(--text-soft)', marginBottom: '16px', fontSize: '0.92rem' };
