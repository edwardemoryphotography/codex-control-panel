'use client';

import { useState } from 'react';

const CHIPS = [
  { id: 'execute', label: 'Execute now' },
  { id: 'research', label: 'Research live' },
  { id: 'architect', label: 'Architect it' },
  { id: 'ship', label: 'Ship it' },
  { id: 'document', label: 'Document it' },
  { id: 'status', label: 'Check status' },
];

export default function Home() {
  const [task, setTask] = useState('');
  const [chip, setChip] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-5 py-8 flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Codex Control Panel</h1>
        <p className="text-sm text-neutral-400 mt-1">Momentum-first routing</p>
      </header>

      <section className="flex-1 flex flex-col gap-6">
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What needs to move forward?"
          className="w-full min-h-[160px] rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-base placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
        />

        <div className="flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button
              key={c.id}
              aria-pressed={chip === c.id}
              onClick={() => setChip(chip === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                chip === c.id
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <footer className="mt-6 flex flex-col gap-3">
        <button
          disabled={!task.trim()}
          onClick={() => alert(`Routed: ${chip ?? 'auto'}\n\n${task}`)}
          className="w-full py-4 rounded-2xl bg-white text-neutral-900 font-medium disabled:opacity-30"
        >
          Route Task
        </button>
        <button
          disabled={!task.trim()}
          onClick={() => alert(`Executing here:\n\n${task}`)}
          className="w-full py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium disabled:opacity-30"
        >
          Fast Execute Here
        </button>
      </footer>
    </main>
  );
}
