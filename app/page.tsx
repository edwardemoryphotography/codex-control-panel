'use client';
import { useState } from 'react';
import OverviewTab from '@/components/overview-tab';
import ProtocolsTab from '@/components/protocols-tab';
import SprintLinkerTab from '@/components/sprint-linker-tab';
import ResumptionLogTab from '@/components/resumption-log-tab';
import BiometricsTab from '@/components/biometrics-tab';
import ConstraintValidatorTab from '@/components/constraint-validator-tab';
import CodexTab from '@/components/codex-tab';

type Tab = 'overview' | 'protocols' | 'sprint-linker' | 'resumption-log' | 'biometrics' | 'constraint-validator' | 'codex';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'protocols', label: 'Protocols' },
  { id: 'sprint-linker', label: 'Sprint Linker' },
  { id: 'resumption-log', label: 'Resumption Log' },
  { id: 'biometrics', label: 'Biometrics' },
  { id: 'constraint-validator', label: 'Constraint Validator' },
  { id: 'codex', label: 'Codex' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div style={{
      width: 'min(1120px, 100%)',
      margin: '0 auto',
      padding: '16px',
      paddingBottom: 'calc(98px + env(safe-area-inset-bottom, 0px))',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 3.8vw, 1.85rem)', letterSpacing: '0.01em' }}>Legacy Codex</h1>
        <span style={{
          border: '1px solid var(--teal)',
          background: 'var(--teal-soft)',
          color: 'var(--teal)',
          fontWeight: 700,
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: '0.78rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>v17 — OPERATIONAL</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {['Reality Filter Active', 'No mock data'].map(p => (
          <span key={p} style={{
            border: '1px solid var(--line-strong)',
            borderRadius: '999px',
            fontSize: '0.78rem',
            color: 'var(--text-soft)',
            padding: '6px 10px',
            background: 'var(--surface-soft)',
          }}>{p}</span>
        ))}
      </div>

      <nav
        role="tablist"
        aria-label="Legacy Codex navigation"
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 1000,
          borderTop: '1px solid var(--line-strong)',
          background: 'rgba(10, 10, 15, 0.96)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '4px',
          padding: '8px',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="tabpanel-content"
            onClick={() => setActiveTab(tab.id)}
            style={{
              border: activeTab === tab.id ? '1px solid var(--teal)' : '1px solid transparent',
              borderRadius: '8px',
              background: activeTab === tab.id ? 'var(--teal-soft)' : 'transparent',
              color: activeTab === tab.id ? 'var(--teal)' : 'var(--text-dim)',
              fontSize: '0.65rem',
              fontWeight: 600,
              lineHeight: 1.2,
              minHeight: '52px',
              padding: '8px 4px',
              cursor: 'pointer',
              transition: 'border-color 0.18s, color 0.18s, background 0.18s',
            }}
          >{tab.label}</button>
        ))}
      </nav>

      <main
        id="tabpanel-content"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'protocols' && <ProtocolsTab />}
        {activeTab === 'sprint-linker' && <SprintLinkerTab />}
        {activeTab === 'resumption-log' && <ResumptionLogTab />}
        {activeTab === 'biometrics' && <BiometricsTab />}
        {activeTab === 'constraint-validator' && <ConstraintValidatorTab />}
        {activeTab === 'codex' && <CodexTab />}
      </main>

      <footer style={{
        marginTop: '32px',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        padding: '12px 0',
        borderTop: '1px solid var(--line)',
      }}>Legacy Codex v17 | Reality Filter Active | No mock data.</footer>
    </div>
  );
}
