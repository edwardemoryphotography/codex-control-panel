"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ROUTES,
  TOOL_OPTIONS,
  applyCorrection,
  buildResult,
  buildResultFromDecision,
  parseAiDecision,
  routeByKey,
  routeByTool,
  type Corrections,
  type RouteKey,
  type RouteResult,
} from "@/lib/routing";

const HISTORY_KEY = "codex-control-panel-history-v2";
const THEME_KEY = "codex-control-panel-theme";
const CORRECT_KEY = "codex-control-panel-corrections-v1";

const CHIP_ACCENTS: Record<RouteKey, string> = {
  execution: "#3d8bff",
  research: "#6a6ff5",
  architecture: "#a259ff",
  deployment: "#f05f9f",
  documentation: "#ff7d54",
  system_state: "#ffb340",
  override: "#3d8bff",
};

const PRIORITY_OPTIONS = [
  { value: "speed", label: "Speed" },
  { value: "balance", label: "Balanced" },
  { value: "accuracy", label: "Accuracy" },
] as const;

type RunState = {
  loading: boolean;
  text: string;
  error: string;
  provider?: string;
};

const SOURCE_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT",
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5c.75 4.94 4.56 8.75 9.5 9.5v2c-4.94.75-8.75 4.56-9.5 9.5h-2c-.75-4.94-4.56-8.75-9.5-9.5v-2c4.94-.75 8.75-4.56 9.5-9.5h2z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 5.5v-.7a2.3 2.3 0 0 0-2.3-2.3H5.8a2.3 2.3 0 0 0-2.3 2.3v7.4a2.3 2.3 0 0 0 2.3 2.3h.7" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
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
  const [routing, setRouting] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [listening, setListening] = useState(false);
  const outputRef = useRef<HTMLElement | null>(null);
  const [voiceStatus, setVoiceStatus] = useState(
    "Voice uses the browser's speech engine — often unavailable on iOS Safari.",
  );
  // Constant initial value: storage.ok differs between server and client,
  // so deriving the initial state from it causes a hydration mismatch.
  const [storageStatus, setStorageStatus] = useState("Checking session memory…");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       Hydrating persisted state from localStorage has to happen after mount
       (the server has no localStorage), which requires setState in an effect. */
    setHistory(storage.get<RouteResult[]>(HISTORY_KEY, []));
    setCorrections(storage.get<Corrections>(CORRECT_KEY, {}));
    setStorageStatus(
      storage.ok
        ? "Local session memory ready."
        : "Local storage unavailable; using in-memory fallback.",
    );

    const savedTheme = storage.get<"light" | "dark" | null>(THEME_KEY, null);
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
    /* eslint-enable react-hooks/set-state-in-effect */
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

  const handleRoute = useCallback(async () => {
    const trimmed = task.trim();
    if (!trimmed) {
      setComposerError("Describe a task first — then route it.");
      return;
    }

    setComposerError("");
    setRouting(true);

    const input = {
      task: trimmed,
      currentTool,
      overrideEnabled,
      hybridEnabled,
      priority,
      corrections,
    };

    let result: RouteResult;
    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: trimmed,
          currentTool,
          priority,
          overrideEnabled,
          hybridEnabled,
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = (await response.json()) as {
        decision?: unknown;
        provider?: string;
      };
      const decision = parseAiDecision(data.decision);
      if (!decision) throw new Error("Unusable AI decision");
      result = buildResultFromDecision(
        input,
        decision,
        SOURCE_LABELS[data.provider ?? ""] ?? "AI",
      );
    } catch {
      // No key configured, offline, or a bad AI response — the local
      // doctrine router always produces a result.
      result = buildResult(input);
    }

    setActiveResult(result);
    setRunStates({});
    saveHistory(result);
    setRouting(false);
    flashStatus("Task routed");
    requestAnimationFrame(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    setListening(true);
    setVoiceStatus("Listening… speak your task.");

    recognition.onresult = (event) => {
      transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTask(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);
      setVoiceStatus(`Voice input error: ${event.error}`);
    };

    recognition.onend = () => {
      setListening(false);
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

      const data = (await response.json()) as {
        text: string;
        provider?: string;
      };
      setRunStates((prev) => ({
        ...prev,
        [index]: {
          loading: false,
          text: data.text,
          error: "",
          provider: SOURCE_LABELS[data.provider ?? ""] ?? "AI",
        },
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
      <div className="ambient" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <main id="main" className="app">
        <header className="shell" aria-label="Control header">
          <div className="brand">
            <div className="logo-wrap">
              <div className="logo-badge" aria-hidden="true">
                <SparkleIcon />
              </div>
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
                aria-label={
                  theme === "dark"
                    ? "Switch to light theme"
                    : "Switch to dark theme"
                }
                onClick={() =>
                  setTheme((current) => (current === "dark" ? "light" : "dark"))
                }
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
              <button className="btn secondary" type="button" onClick={clearSession}>
                Clear
              </button>
            </div>
          </div>
        </header>

        <section className="hero" aria-label="Intro">
          <h1>
            What should we <span className="gradient-text">route</span> today?
          </h1>
          <p>
            Describe the task and the panel picks the right tool, writes the
            prompt, and runs it — doctrine and overrides baked in.
          </p>
        </section>

        <section aria-label="Task input">
          <div className={`glow-ring${listening || routing ? " glowing" : ""}`}>
            <div className="composer">
              <label className="sr-only" htmlFor="taskInput">
                Task / idea / request
              </label>
              <textarea
                id="taskInput"
                value={task}
                onChange={(event) => {
                  setTask(event.target.value);
                  if (composerError) setComposerError("");
                }}
                onKeyDown={(event) => {
                  if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key === "Enter"
                  ) {
                    handleRoute();
                  }
                }}
                placeholder="Describe a task… e.g. Design the architecture for an astrophotography workshop app, then generate the build prompt for Gemini and prep deployment steps."
              />
              <div className="composer-bar">
                <span className="composer-hint">⌘↩ to route</span>
                <div className="composer-actions">
                  <button
                    id="voiceBtn"
                    className={`icon-btn${listening ? " listening" : ""}`}
                    type="button"
                    aria-label="Start voice input"
                    onClick={startVoiceInput}
                  >
                    <MicIcon />
                  </button>
                  <button
                    id="routeBtn"
                    className="btn primary"
                    type="button"
                    disabled={routing}
                    onClick={handleRoute}
                  >
                    {routing ? (
                      <>
                        <span className="spinner" /> Routing…
                      </>
                    ) : (
                      <>
                        <SparkleIcon />
                        Route task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {composerError && (
            <div
              className="composer-error"
              role="alert"
              style={{ marginTop: "0.6rem", paddingInline: "0.5rem" }}
            >
              {composerError}
            </div>
          )}
          <div
            className="status"
            id="voiceStatus"
            style={{ marginTop: "0.6rem", paddingInline: "0.5rem" }}
          >
            {voiceStatus}
          </div>
        </section>

        <section className="panel" aria-label="Routing preferences">
          <div className="panel-head">
            <h2>Preferences</h2>
            <span className="eyebrow">Control surface</span>
          </div>
          <div className="grid two">
            <div className="stack">
              <div>
                <label className="label" htmlFor="currentTool">
                  Current tool context
                </label>
                <div className="select-wrap">
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
              </div>
              <div>
                <span className="label" id="priorityLabel">
                  Priority mode
                </span>
                <div
                  className="segmented"
                  role="group"
                  aria-labelledby="priorityLabel"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={priority === option.value}
                      onClick={() => setPriority(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="stack">
              <div className="switch-row">
                <div className="switch-copy">
                  <strong>Execution override</strong>
                  <span>Stay put when switching adds friction</span>
                </div>
                <button
                  id="overrideToggle"
                  className="switch"
                  type="button"
                  role="switch"
                  aria-checked={overrideEnabled}
                  aria-label="Execution override"
                  onClick={() => setOverrideEnabled((value) => !value)}
                >
                  <span className="switch-thumb" />
                </button>
              </div>
              <div className="switch-row">
                <div className="switch-copy">
                  <strong>Hybrid routing</strong>
                  <span>Split multi-part tasks across tools</span>
                </div>
                <button
                  id="hybridToggle"
                  className="switch"
                  type="button"
                  role="switch"
                  aria-checked={hybridEnabled}
                  aria-label="Hybrid routing"
                  onClick={() => setHybridEnabled((value) => !value)}
                >
                  <span className="switch-thumb" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel" aria-label="Routing map">
          <div className="panel-head">
            <h2>Routing map</h2>
            <span className="eyebrow">Doctrine</span>
          </div>
          <div className="tool-grid" aria-label="Tool doctrine overview">
            {ROUTES.map((route) => (
              <div
                className="tool-chip"
                key={route.key}
                style={
                  {
                    "--chip-accent": CHIP_ACCENTS[route.key],
                  } as React.CSSProperties
                }
              >
                <strong>{route.tool}</strong>
                <span>{route.map}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" aria-label="Routing output" ref={outputRef}>
          <div className="panel-head">
            <h2>Routing output</h2>
            {summary?.source && summary.source !== "doctrine" ? (
              <span className="pill primary">
                <SparkleIcon className="pill-icon" />
                Routed by {summary.source}
              </span>
            ) : summary ? (
              <span className="pill">Doctrine routing</span>
            ) : (
              <span className="eyebrow">Tool · prompt · live run</span>
            )}
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
          <div className="help" style={{ margin: ".7rem 0 0" }}>
            Match strength = keyword overlap with the doctrine lane, not model
            confidence.
          </div>
          <div
            className="output-wrap"
            id="outputWrap"
            key={summary?.createdAt ?? "empty"}
            style={{ marginTop: "var(--space-4)" }}
          >
            {!summary ? (
              <div className="empty">
                <SparkleIcon />
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
                          <>
                            <SparkleIcon />
                            Run step live
                          </>
                        )}
                      </button>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => copyText(item.prompt, "Prompt copied")}
                      >
                        <CopyIcon />
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
                        <CopyIcon />
                        Copy card
                      </button>
                    </div>
                    {(runState?.loading ||
                      runState?.text ||
                      runState?.error) && (
                      <div className="run-out">
                        {runState.loading && (
                          <h4>
                            Thinking
                            <span className="thinking-dots" aria-hidden="true">
                              <i />
                              <i />
                              <i />
                            </span>
                          </h4>
                        )}
                        {runState.text && (
                          <>
                            <h4>Live result — {runState.provider ?? "AI"}</h4>
                            {runState.text}
                          </>
                        )}
                        {runState.error && (
                          <>
                            <h4>Live run unavailable</h4>
                            Couldn&apos;t reach the API here ({runState.error}).
                            Use “Copy prompt” and paste into your tool, or set{" "}
                            <code>ANTHROPIC_API_KEY</code> /{" "}
                            <code>OPENAI_API_KEY</code> in your deployment
                            environment for live runs.
                          </>
                        )}
                      </div>
                    )}
                    <div className="correct-row">
                      <span className="help">Wrong tool?</span>
                      <div className="select-wrap">
                        <select className="correct-select" defaultValue={fromKey}>
                          {ROUTES.map((route) => (
                            <option key={route.key} value={route.key}>
                              {route.tool}
                            </option>
                          ))}
                        </select>
                      </div>
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

        <section className="panel" aria-label="History">
          <div className="panel-head">
            <h2>History</h2>
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
                <HistoryIcon />
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
            <span className="status-dot" aria-hidden="true" />
            {storageStatus}
          </div>
          <div className="status">Next.js • deploy on Vercel</div>
        </section>
      </main>
    </>
  );
}
