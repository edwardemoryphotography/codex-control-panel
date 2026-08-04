"use client";

import { useMemo, useState } from "react";
import type { RouteResult } from "@/lib/routing";
import {
  EVIDENCE_KINDS,
  EXECUTION_LANES,
  RISK_LEVELS,
  SENSITIVITIES,
  TASK_TYPES,
  validateRouteProposal,
  type RouteViolation,
} from "@/lib/route-contract";
import { KNOWN_AGENTS, KNOWN_REPOSITORIES, screenProtectedOperations } from "@/lib/route-registry";
import {
  draftProposalFromRouteResult,
  routeSourceLabel,
  toPersistPayload,
  type EditableRouteProposal,
} from "@/lib/propose-route";
import { classifyPersistError, type PersistErrorView } from "@/lib/persist-errors";

export interface PersistSuccessView {
  routedRequestId: string | null;
  workspaceName: string | null;
  workspaceId: string | null;
  actionId: string | null;
  eventLogged: boolean;
  evidenceStatus: string | null;
  evidenceClaim: string | null;
  warnings: string[];
  corrected: string | null;
}

function extractSuccess(body: Record<string, unknown>): PersistSuccessView {
  const routed =
    body.routedRequest && typeof body.routedRequest === "object"
      ? (body.routedRequest as Record<string, unknown>)
      : null;
  const workspace =
    body.workspace && typeof body.workspace === "object"
      ? (body.workspace as Record<string, unknown>)
      : null;
  const evidence =
    body.evidence && typeof body.evidence === "object"
      ? (body.evidence as Record<string, unknown>)
      : null;
  const warnings = Array.isArray(body.warnings)
    ? body.warnings.filter((w): w is string => typeof w === "string")
    : [];

  return {
    routedRequestId: typeof routed?.id === "string" ? routed.id : null,
    workspaceName: typeof workspace?.name === "string" ? workspace.name : null,
    workspaceId: typeof workspace?.id === "string" ? workspace.id : null,
    actionId: typeof body.actionId === "string" ? body.actionId : null,
    eventLogged: Boolean(body.eventLogged),
    evidenceStatus: typeof evidence?.status === "string" ? evidence.status : null,
    evidenceClaim: typeof evidence?.claim === "string" ? evidence.claim : null,
    warnings,
    corrected: typeof body.corrected === "string" ? body.corrected : null,
  };
}

type Props = {
  activeResult: RouteResult | null;
};

export default function RoutePersistPanel({ activeResult }: Props) {
  const resultKey = activeResult?.createdAt ?? "none";
  const [draftKey, setDraftKey] = useState(resultKey);
  const [draft, setDraft] = useState<EditableRouteProposal | null>(() =>
    activeResult ? draftProposalFromRouteResult(activeResult, "") : null,
  );
  const [accessToken, setAccessToken] = useState("");
  const [tokenEntered, setTokenEntered] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [inlineViolations, setInlineViolations] = useState<RouteViolation[]>([]);
  const [errorView, setErrorView] = useState<PersistErrorView | null>(null);
  const [success, setSuccess] = useState<PersistSuccessView | null>(null);

  // Reset the editable proposal when the upstream route result changes.
  // (React-recommended "adjust state when props change" during render.)
  if (resultKey !== draftKey) {
    setDraftKey(resultKey);
    setDraft(
      activeResult
        ? draftProposalFromRouteResult(activeResult, draft?.workspaceId ?? "")
        : null,
    );
    setInlineViolations([]);
    setErrorView(null);
    setSuccess(null);
  }

  const protectedOps = useMemo(
    () => (draft ? screenProtectedOperations(draft.intent) : []),
    [draft],
  );

  if (!activeResult || !draft) {
    return (
      <section className="panel" aria-label="Foundry persistence">
        <div className="panel-head">
          <h2>Foundry persistence</h2>
          <span className="eyebrow">Intake → Foundry</span>
        </div>
        <div className="empty">
          Route a task first, then review the proposed Foundry route before
          persisting.
        </div>
      </section>
    );
  }

  const patch = <K extends keyof EditableRouteProposal>(
    key: K,
    value: EditableRouteProposal[K],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSuccess(null);
  };

  const patchConfirmation = (
    key: keyof EditableRouteProposal["confirmations"],
    value: boolean,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            confirmations: { ...current.confirmations, [key]: value },
          }
        : current,
    );
    setSuccess(null);
  };

  const handlePersist = async () => {
    setPersisting(true);
    setErrorView(null);
    setInlineViolations([]);
    setSuccess(null);

    const payload = toPersistPayload(draft);
    const local = validateRouteProposal(payload);
    if (!local.ok) {
      setInlineViolations(local.violations);
      setErrorView({
        kind: "invalid_route",
        title: "Invalid route",
        message: "Fix the highlighted violations before persisting.",
        violations: local.violations,
      });
      setPersisting(false);
      return;
    }

    try {
      const response = await fetch("/api/route/persist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-codex-key": accessToken,
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      if (!response.ok) {
        const classified = classifyPersistError(response.status, body);
        setErrorView(classified);
        if (classified.violations?.length) {
          setInlineViolations(classified.violations);
        }
        setPersisting(false);
        return;
      }

      setSuccess(extractSuccess(body));
      // Keep the original route id available for a subsequent correction —
      // never overwrite the original client-side; corrections append.
      if (typeof body.routedRequest === "object" && body.routedRequest) {
        const id = (body.routedRequest as { id?: string }).id;
        if (id) {
          setDraft((current) =>
            current
              ? {
                  ...current,
                  supersedesRequestId: id,
                  correctionReason: "",
                }
              : current,
          );
        }
      }
    } catch {
      setErrorView({
        kind: "backend_unavailable",
        title: "Backend environment unavailable",
        message:
          "Could not reach /api/route/persist. Check the Control Panel deployment and try again.",
      });
    } finally {
      setPersisting(false);
    }
  };

  const startCorrection = () => {
    if (!success?.routedRequestId) return;
    setDraft((current) =>
      current
        ? {
            ...current,
            supersedesRequestId: success.routedRequestId ?? "",
            correctionReason: "",
            routeSource: "user",
            provenance: "user_confirmed",
          }
        : current,
    );
    setSuccess(null);
    setErrorView(null);
  };

  return (
    <section className="panel persist-panel" aria-label="Foundry persistence">
      <div className="panel-head">
        <h2>Foundry persistence</h2>
        <span className="pill">POST /api/route/persist</span>
      </div>

      <p className="help" style={{ marginBottom: "var(--space-4)" }}>
        Review the proposed route, approve any required confirmations, then
        persist to Foundry. The Control Panel is intake only — it is not a
        second project database.
      </p>

      <div className="persist-source-banner" data-source={draft.routeSource}>
        <strong>Route source:</strong> {routeSourceLabel(draft.routeSource)}
        {draft.routeSource === "doctrine_fallback" && (
          <span className="help">
            {" "}
            — degraded deterministic routing, not an AI-model decision.
          </span>
        )}
      </div>

      <div className="persist-grid">
        <Field
          id="persist-intent"
          label="Intent (verbatim)"
          help="Owner ask preserved exactly."
        >
          <textarea
            id="persist-intent"
            value={draft.intent}
            onChange={(e) => patch("intent", e.target.value)}
            rows={3}
          />
        </Field>

        <Field
          id="persist-workspace"
          label="Foundry workspace ID"
          help="Must be a real UUID from Foundry workspaces."
        >
          <input
            id="persist-workspace"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={draft.workspaceId}
            onChange={(e) => patch("workspaceId", e.target.value)}
          />
        </Field>

        <Field id="persist-repo" label="Repository">
          <select
            id="persist-repo"
            value={draft.repository}
            onChange={(e) => patch("repository", e.target.value)}
          >
            {KNOWN_REPOSITORIES.map((repo) => (
              <option key={repo.fullName} value={repo.fullName}>
                {repo.fullName} (visibility: {repo.visibility})
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="persist-path"
          label="Repository path (optional)"
          help="Relative path only — no .., absolute, or ~ paths."
        >
          <input
            id="persist-path"
            type="text"
            value={draft.repositoryPath}
            onChange={(e) => patch("repositoryPath", e.target.value)}
            placeholder="foundry-console/src/app"
          />
        </Field>

        <Field id="persist-task-type" label="Task type">
          <select
            id="persist-task-type"
            value={draft.taskType}
            onChange={(e) =>
              patch("taskType", e.target.value as EditableRouteProposal["taskType"])
            }
          >
            {TASK_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-lane" label="Execution lane">
          <select
            id="persist-lane"
            value={draft.executionLane}
            onChange={(e) =>
              patch(
                "executionLane",
                e.target.value as EditableRouteProposal["executionLane"],
              )
            }
          >
            {EXECUTION_LANES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-agent" label="Selected agent">
          <select
            id="persist-agent"
            value={draft.selectedAgent}
            onChange={(e) =>
              patch(
                "selectedAgent",
                e.target.value as EditableRouteProposal["selectedAgent"],
              )
            }
          >
            {KNOWN_AGENTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-risk" label="Risk">
          <select
            id="persist-risk"
            value={draft.risk}
            onChange={(e) =>
              patch("risk", e.target.value as EditableRouteProposal["risk"])
            }
          >
            {RISK_LEVELS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-sensitivity" label="Sensitivity">
          <select
            id="persist-sensitivity"
            value={draft.sensitivity}
            onChange={(e) =>
              patch(
                "sensitivity",
                e.target.value as EditableRouteProposal["sensitivity"],
              )
            }
          >
            {SENSITIVITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-evidence" label="Required evidence">
          <input
            id="persist-evidence"
            type="text"
            value={draft.requiredEvidence}
            onChange={(e) => patch("requiredEvidence", e.target.value)}
          />
        </Field>

        <Field id="persist-evidence-kind" label="Evidence kind">
          <select
            id="persist-evidence-kind"
            value={draft.evidenceKind}
            onChange={(e) =>
              patch(
                "evidenceKind",
                e.target.value as EditableRouteProposal["evidenceKind"],
              )
            }
          >
            {EVIDENCE_KINDS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>

        <Field id="persist-rationale" label="Rationale">
          <textarea
            id="persist-rationale"
            value={draft.rationale}
            onChange={(e) => patch("rationale", e.target.value)}
            rows={2}
          />
        </Field>

        <Field id="persist-confidence" label={`Confidence (${draft.confidence})`}>
          <input
            id="persist-confidence"
            type="range"
            min={0}
            max={100}
            value={draft.confidence}
            onChange={(e) => patch("confidence", Number(e.target.value))}
          />
        </Field>

        <Field id="persist-provenance" label="Provenance">
          <input
            id="persist-provenance"
            type="text"
            value={draft.provenance}
            readOnly
            aria-readonly="true"
          />
        </Field>
      </div>

      <div className="persist-confirmations" aria-label="Required confirmations">
        <h3>Explicit confirmations</h3>
        <p className="help">
          Defaults stay off. Confirmations are never automatically enabled.
          {protectedOps.length > 0 && (
            <> Detected protected operation screen: {protectedOps.join(", ")}.</>
          )}
        </p>
        <ConfirmationToggle
          id="confirm-protected"
          label="Protected operation"
          description="Required when the intent matches deletion, merge, production deploy, migration apply, secrets, RLS changes, or force-push."
          checked={draft.confirmations.protectedOperation}
          onChange={(value) => patchConfirmation("protectedOperation", value)}
        />
        <ConfirmationToggle
          id="confirm-destructive"
          label="Destructive operation"
          description="Required for deletion-shaped intents."
          checked={draft.confirmations.destructive}
          onChange={(value) => patchConfirmation("destructive", value)}
        />
        <ConfirmationToggle
          id="confirm-public"
          label="Public exposure"
          description="Required when private/restricted content routes to a repository whose visibility is not verified-private."
          checked={draft.confirmations.publicExposure}
          onChange={(value) => patchConfirmation("publicExposure", value)}
        />
        <div className="switch-row">
          <div className="switch-copy">
            <strong>Create linked actions work item</strong>
            <span>Optional Foundry actions row linked to this route</span>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={draft.createAction}
            aria-label="Create linked actions work item"
            onClick={() => patch("createAction", !draft.createAction)}
          >
            <span className="switch-thumb" />
          </button>
        </div>
      </div>

      <div className="persist-correction" aria-label="Correction fields">
        <h3>Correction (append-only)</h3>
        <p className="help">
          To correct a persisted route, submit a new complete proposal with the
          original id. The original is never edited or overwritten client-side.
        </p>
        <Field id="persist-supersedes" label="Supersedes request ID">
          <input
            id="persist-supersedes"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={draft.supersedesRequestId}
            onChange={(e) => patch("supersedesRequestId", e.target.value)}
            placeholder="UUID of the route this corrects"
          />
        </Field>
        <Field id="persist-correction-reason" label="Correction reason">
          <textarea
            id="persist-correction-reason"
            value={draft.correctionReason}
            onChange={(e) => patch("correctionReason", e.target.value)}
            rows={2}
            placeholder="Why this correction replaces the prior route"
          />
        </Field>
      </div>

      <div className="persist-auth" aria-label="Owner authentication panel">
        <h3>Owner authentication</h3>
        <p className="help">
          Uses <code>APP_ACCESS_TOKEN</code> via the <code>x-codex-key</code>{" "}
          header. Kept in session memory only — never written to localStorage,
          never logged, never rendered back after entry.
        </p>
        {!tokenEntered ? (
          <Field id="persist-token" label="Owner access token">
            <input
              id="persist-token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter token for this browser session"
            />
          </Field>
        ) : (
          <p className="token-ready" data-testid="token-ready">
            Owner token held in session memory for this tab. Value is not shown.
          </p>
        )}
        <div className="persist-actions">
          {!tokenEntered ? (
            <button
              className="btn secondary"
              type="button"
              disabled={!accessToken.trim()}
              onClick={() => {
                if (accessToken.trim()) setTokenEntered(true);
              }}
            >
              Hold token in session
            </button>
          ) : (
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setAccessToken("");
                setTokenEntered(false);
              }}
            >
              Clear session token
            </button>
          )}
        </div>
      </div>

      {(inlineViolations.length > 0 || errorView) && (
        <div className="persist-error" role="alert">
          {errorView && (
            <>
              <strong>{errorView.title}</strong>
              <p>{errorView.message}</p>
            </>
          )}
          {inlineViolations.length > 0 && (
            <ul>
              {inlineViolations.map((violation) => (
                <li key={`${violation.code}-${violation.message}`}>
                  <code>{violation.code}</code>: {violation.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {success && (
        <div className="persist-success" role="status" data-testid="persist-success">
          <strong>
            {success.corrected ? "Correction persisted" : "Route persisted"}
          </strong>
          <ul>
            <li>
              Routed request:{" "}
              <code>{success.routedRequestId ?? "unavailable"}</code>
            </li>
            <li>
              Workspace: {success.workspaceName ?? "—"}{" "}
              {success.workspaceId ? (
                <code>({success.workspaceId})</code>
              ) : null}
            </li>
            <li>
              Action / work-item ID:{" "}
              <code>{success.actionId ?? "none"}</code>
            </li>
            <li>Event logged: {success.eventLogged ? "yes" : "no"}</li>
            <li>
              Pending evidence:{" "}
              <span data-testid="pending-evidence">
                {success.evidenceStatus === "pending"
                  ? "pending"
                  : success.evidenceStatus ?? "none"}
              </span>
              {success.evidenceClaim ? ` — ${success.evidenceClaim}` : ""}
            </li>
            {success.corrected && (
              <li>
                Correction of: <code>{success.corrected}</code>
              </li>
            )}
            {success.warnings.length > 0 && (
              <li>
                Warnings:
                <ul>
                  {success.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
          <button className="btn secondary" type="button" onClick={startCorrection}>
            Prepare correction of this route
          </button>
        </div>
      )}

      <div className="persist-actions">
        <button
          className="btn primary"
          type="button"
          disabled={persisting || !accessToken.trim()}
          onClick={() => void handlePersist()}
          data-testid="persist-submit"
        >
          {persisting ? (
            <>
              <span className="spinner" /> Persisting…
            </>
          ) : draft.supersedesRequestId.trim() ? (
            "Submit correction"
          ) : (
            "Persist route to Foundry"
          )}
        </button>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="persist-field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {help ? <p className="help">{help}</p> : null}
    </div>
  );
}

function ConfirmationToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="switch-row">
      <div className="switch-copy">
        <strong id={`${id}-label`}>{label}</strong>
        <span>{description}</span>
      </div>
      <button
        id={id}
        className="switch"
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        data-testid={id}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}
