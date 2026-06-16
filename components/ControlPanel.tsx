"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ROUTES,
  TOOL_OPTIONS,
  applyCorrection,
  buildResult,
  routeByKey,
  routeByTool,
  type Corrections,
  type RouteKey,
  type RouteResult,
} from "@/lib/routing";

const HISTORY_KEY = "codex-control-panel-history-v2";
const THEME_KEY = "codex-control-panel-theme";
const CORRECT_KEY = "codex-control-panel-corrections-v1";

type RunState = {
  loading: boolean;
  text: string;
  error: string;
};

function createStorage() {
  const memoryStore: Record<string, unknown> = {};
  try {
    const testKey = "__codex_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return {
      ok: true,
      get<T>(key: string, fallback: T): T {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      },
      set<T>(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value));
      },
      del(key: string) {
        localStorage.removeItem(key);
      },
    };
  } catch {
    return {
      ok: false,
      get<T>(key: string, fallback: T): T {
        return (key in memoryStore ? memoryStore[key] : fallback) as T;
      },
      set<T>(key: string, value: T) {
        memoryStore[key] = value;
      },
      del(key: string) {
        delete memoryStore[key];
      },
    };
  }
}

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const win = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition;
}

export default function ControlPanel() {
  const storage = useMemo(() => createStorage(), []);

  const [task, setTask] = useState("");
  const [currentTool, setCurrentTool] = useState(TOOL_OPTIONS[0]);
  const [overrideEnabled, setOverrideEnabled] = useState(true);
  const [hybridEnabled, setHybridEnabled] = useState(true);
  const [priority, setPriority] = useState("balance");
  const [history, setHistory] = useState<RouteResult[]>([]);
  const [corrections, setCorrections] = useState<Corrections>({});
  const [activeResult, setActiveResult] = useState<RouteResult | null>(null);
  const [runStates, setRunStates] = useState<Record<number, RunState>>({});
  const [voiceStatus, setVoiceStatus] = useState(
    "Voice uses the browser's speech engine — often unavailable on iOS Safari.",
  );
  const [storageStatus, setStorageStatus] = useState(
    storage.ok
      ? "Local session memory ready."
      : "Local storage unavailable; using in-memory fallback.",
  );
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setHistory(storage.get<RouteResult[]>(HISTORY_KEY, []));
    setCorrections(storage.get<Corrections>(CORRECT_KEY, {}));

    const savedTheme = storage.get<"light" | "dark" | null>(THEME_KEY, null);
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, [storage]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    storage.set(THEME_KEY, theme);
  }, [theme, storage]);

  const flashStatus = useCallback((message: string) => {
    setStorageStatus(message);
    window.setTimeout(() => {
      setStorageStatus(
        storage.ok
          ? "Local session memory ready."
          : "In-memory session fallback.",
      );
    }, 2400);
  }, [storage.ok]);

  const copyText = useCallback(
    async (text: string, label = "Copied") => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          flashStatus(label);
          return;
        }
      } catch {
        // fall through
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        flashStatus(label);
      } catch {
        flashStatus("Copy failed");
      }
      textarea.remove();
    },
    [flashStatus],
  );

  const saveHistory = useCallback(
    (result: RouteResult) => {
      setHistory((prev) => {
        const next = [result, ...prev].slice(0, 24);
        storage.set(HISTORY_KEY, next);
        return next;
      });
    },
    [storage],
  );

  const handleRoute = useCallback(() => {
    const trimmed = task.trim();
    if (!trimmed) {
      flashStatus("Add a task first");
      return;
    }

    const result = buildResult({
      task: trimmed,
      currentTool,
      overrideEnabled,
      hybridEnabled,
      priority,
      corrections,
    });

    setActiveResult(result);
    setRunStates({});
    saveHistory(result);
    flashStatus("Task routed");
  }, [
    task,
    currentTool,
    overrideEnabled,
    hybridEnabled,
    priority,
    corrections,
    saveHistory,
    flashStatus,
  ]);

  const exportSession = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "Codex Control Panel v2",
      count: history.length,
      routes: history,
      corrections,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `codex-session-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    flashStatus("Session exported");
  }, [history, corrections, flashStatus]);

  const clearSession = useCallback(() => {
    setHistory([]);
    storage.set(HISTORY_KEY, []);
    setActiveResult(null);
    setRunStates({});
    flashStatus("Session cleared");
  }, [storage, flashStatus]);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setVoiceStatus(
        "Speech recognition is not available in this browser (common on iOS Safari). Type or paste instead.",
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let transcript = "";
    setVoiceStatus("Listening… speak your task.");

    recognition.onresult = (event) => {
      transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTask(transcript);
    };

    recognition.onerror = (event) => {
      setVoiceStatus(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      setVoiceStatus(
        transcript ? "Voice input captured." : "Voice input stopped.",
      );
    };

    recognition.start();
  }, []);

  const runWithClaude = useCallback(async (promptText: string, index: number) => {
    setRunStates((prev) => ({
      ...prev,
      [index]: { loading: true, text: "", error: "" },
    }));

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `API ${response.status}`);
      }

      const data = (await response.json()) as { text: string };
      setRunStates((prev) => ({
        ...prev,
        [index]: { loading: false, text: data.text, error: "" },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      setRunStates((prev) => ({
        ...prev,
        [index]: { loading: false, text: "", error: message },
      }));
    }
  }, []);

  const loadHistoryItem = useCallback((item: RouteResult) => {
    setTask(item.task);
    setActiveResult(item);
    setRunStates({});
    flashStatus("History item loaded");
  }, [flashStatus]);

  const teachRouter = useCallback(
    (fromKey: RouteKey, toKey: RouteKey) => {
      if (!activeResult) return;
      const next = applyCorrection(
        activeResult.task,
        fromKey,
        toKey,
        corrections,
      );
      setCorrections(next);
      storage.set(CORRECT_KEY, next);
      flashStatus(`Learned: route these toward ${routeByKey[toKey].tool}`);
    },
    [activeResult, corrections, storage, flashStatus],
  );

  const summary = activeResult;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="app">
        <section className="shell" aria-label="Control header">
          <div className="brand">
            <div className="logo-wrap">
              <svg
                className="logo"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                aria-label="Codex logo"
              >
                <rect x="8" y="8" width="48" height="48" rx="14" />
                <path d="M21 24h15a8 8 0 1 1 0 16H21" />
                <path d="M27 18v28" />
                <path d="M41 24l7 8-7 8" />
              </svg>
              <div>
                <div className="title">Codex Control Panel</div>
                <div className="subtitle">
                  Route once. Run it here. Teach it when it&apos;s wrong.
                </div>
              </div>
            </div>
            <div className="toolbar">
              <button
                className="icon-btn"
                type="button"
                aria-label="Switch theme"
                onClick={() =>
                  setTheme((current) => (current === "dark" ? "light" : "dark"))
                }
              >
                ◐
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={clearSession}
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Routing map</h2>
            <span className="help">Doctrine + override baked in</span>
          </div>
          <div className="tool-grid" aria-label="Tool doctrine overview">
            {ROUTES.map((route) => (
              <div className="tool-chip" key={route.key}>
                <strong>{route.tool}</strong>
                <span>{route.map}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Input</h2>
            <span className="help">iPhone-first control surface</span>
          </div>
          <div className="grid two">
            <div className="stack">
              <div>
                <label className="label" htmlFor="taskInput">
                  Task / idea / request
                </label>
                <textarea
                  id="taskInput"
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      (event.metaKey || event.ctrlKey) &&
                      event.key === "Enter"
                    ) {
                      handleRoute();
                    }
                  }}
                  placeholder="Example: Design the architecture for an astrophotography workshop app, then generate the build prompt for Gemini and prep deployment steps."
                />
              </div>
              <div className="actions">
                <button
                  id="routeBtn"
                  className="btn primary"
                  type="button"
                  onClick={handleRoute}
                >
                  Route task
                </button>
                <button
                  id="voiceBtn"
                  className="btn secondary"
                  type="button"
                  onClick={startVoiceInput}
                >
                  Start voice input
                </button>
              </div>
              <div className="status" id="voiceStatus">
                {voiceStatus}
              </div>
            </div>
            <div className="stack">
              <div>
                <label className="label" htmlFor="currentTool">
                  Current tool context
                </label>
                <select
                  id="currentTool"
                  value={currentTool}
                  onChange={(event) => setCurrentTool(event.target.value)}
                >
                  {TOOL_OPTIONS.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toggles">
                <label className="toggle">
                  <input
                    id="overrideToggle"
                    type="checkbox"
                    checked={overrideEnabled}
                    onChange={(event) =>
                      setOverrideEnabled(event.target.checked)
                    }
                  />
                  Execution override
                </label>
                <label className="toggle">
                  <input
                    id="hybridToggle"
                    type="checkbox"
                    checked={hybridEnabled}
                    onChange={(event) => setHybridEnabled(event.target.checked)}
                  />
                  Hybrid routing
                </label>
              </div>
              <div>
                <label className="label" htmlFor="prioritySelect">
                  Priority mode
                </label>
                <select
                  id="prioritySelect"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="speed">Speed first</option>
                  <option value="accuracy">Accuracy first</option>
                  <option value="balance">Balanced</option>
                </select>
              </div>
              <div className="help">
                Override keeps work in the current tool when switching adds
                friction and that tool can reasonably finish.
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Routing output</h2>
            <span className="help">Tool + prompt + run it live</span>
          </div>
          <div className="mini-grid" id="summaryGrid">
            <div className="mini-card">
              <div className="k">Primary route</div>
              <div className="v" id="summaryRoute">
                {summary?.primaryRoute ?? "—"}
              </div>
            </div>
            <div className="mini-card">
              <div className="k">Mode</div>
              <div className="v" id="summaryMode">
                {summary?.mode ?? "—"}
              </div>
            </div>
            <div className="mini-card">
              <div className="k">Match strength</div>
              <div className="v" id="summaryConfidence">
                {summary?.strength ? `${summary.strength}%` : "—"}
              </div>
              <div className="strength-bar">
                <i
                  id="strengthFill"
                  style={{ width: `${summary?.strength ?? 0}%` }}
                />
              </div>
            </div>
            <div className="mini-card">
              <div className="k">Next action</div>
              <div className="v" id="summaryNext">
                {summary?.nextAction ?? "—"}
              </div>
            </div>
          </div>
          <div className="help" style={{ margin: ".6rem 0 0" }}>
            Match strength = keyword overlap with the doctrine lane, not model
            confidence.
          </div>
          <div
            className="output-wrap"
            id="outputWrap"
            style={{ marginTop: "var(--space-4)" }}
          >
            {!summary ? (
              <div className="empty">
                Route a task to generate prompts and decisions.
              </div>
            ) : (
              summary.prompts.map((item, index) => {
                const fromKey: RouteKey =
                  item.category === "execution override"
                    ? "execution"
                    : (routeByTool[item.tool]?.key ?? "architecture");
                const runState = runStates[index];

                return (
                  <article className="output-card" key={`${item.part}-${index}`}>
                    <div className="meta">
                      <span className="pill primary">{item.part}</span>
                      <span className="pill">{item.tool}</span>
                      <span className="pill success">{item.category}</span>
                    </div>
                    <h3>Selected tool: {item.tool}</h3>
                    <p>
                      <strong>Reason:</strong> {item.reason}
                    </p>
                    <p>
                      <strong>Next action:</strong>{" "}
                      {index === 0
                        ? summary.nextAction
                        : `Run this after ${summary.prompts[0].part.toLowerCase()} completes.`}
                    </p>
                    <div className="prompt-box">{item.prompt}</div>
                    <div className="prompt-actions">
                      <button
                        className="btn primary"
                        type="button"
                        disabled={runState?.loading}
                        onClick={() => runWithClaude(item.prompt, index)}
                      >
                        {runState?.loading ? (
                          <>
                            <span className="spinner" /> Running…
                          </>
                        ) : (
                          "Run step with Claude"
                        )}
                      </button>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => copyText(item.prompt, "Prompt copied")}
                      >
                        Copy prompt
                      </button>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() =>
                          copyText(
                            [
                              `Selected tool: ${item.tool}`,
                              `Reason: ${item.reason}`,
                              `Next action: ${
                                index === 0
                                  ? summary.nextAction
                                  : `Run after ${summary.prompts[0].part.toLowerCase()} completes.`
                              }`,
                              "",
                              item.prompt,
                            ].join("\n"),
                            "Card copied",
                          )
                        }
                      >
                        Copy card
                      </button>
                    </div>
                    {(runState?.loading ||
                      runState?.text ||
                      runState?.error) && (
                      <div className="run-out">
                        {runState.loading && <h4>Claude is working…</h4>}
                        {runState.text && (
                          <>
                            <h4>Live result — Claude</h4>
                            {runState.text}
                          </>
                        )}
                        {runState.error && (
                          <>
                            <h4>Live run unavailable</h4>
                            Couldn&apos;t reach the API here ({runState.error}).
                            Use “Copy prompt” and paste into your tool. Set{" "}
                            <code>ANTHROPIC_API_KEY</code> in your environment
                            for live runs on Vercel.
                          </>
                        )}
                      </div>
                    )}
                    <div className="correct-row">
                      <span className="help">Wrong tool?</span>
                      <select className="correct-select" defaultValue={fromKey}>
                        {ROUTES.map((route) => (
                          <option key={route.key} value={route.key}>
                            {route.tool}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={(event) => {
                          const select = event.currentTarget
                            .parentElement
                            ?.querySelector("select") as HTMLSelectElement | null;
                          if (!select) return;
                          teachRouter(
                            fromKey,
                            select.value as RouteKey,
                          );
                        }}
                      >
                        Teach router
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>History / memory</h2>
            <div className="toolbar">
              <button
                id="exportBtn"
                className="btn secondary"
                type="button"
                onClick={exportSession}
              >
                Export session
              </button>
            </div>
          </div>
          <div className="history-list" id="historyList">
            {history.length === 0 ? (
              <div className="empty">
                No saved routes yet. Your last decisions appear here.
              </div>
            ) : (
              history.map((item, index) => {
                const firstPrompt = item.prompts[0];
                return (
                  <article className="history-item" key={`${item.createdAt}-${index}`}>
                    <button type="button" onClick={() => loadHistoryItem(item)}>
                      <div className="history-top">
                        <div>
                          <div className="history-title">
                            {item.primaryRoute} • {item.mode}
                          </div>
                          <div className="history-meta">
                            {new Date(item.createdAt).toLocaleString()} •{" "}
                            {item.strength}% match
                          </div>
                        </div>
                        <span className="pill">{firstPrompt.tool}</span>
                      </div>
                      <div className="history-snippet">
                        {item.task.slice(0, 140)}
                        {item.task.length > 140 ? "…" : ""}
                      </div>
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="footer-row">
          <div className="status" id="storageStatus">
            {storageStatus}
          </div>
          <div className="status">Next.js • deploy on Vercel</div>
        </section>
      </main>
    </>
  );
}
