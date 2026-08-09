/**
 * Map /api/route/persist HTTP responses to owner-facing messages.
 * Never includes or echoes the access token.
 */

export type PersistErrorKind =
  | "locked"
  | "unauthorized"
  | "backend_unavailable"
  | "invalid_route"
  | "policy_confirmation"
  | "conflict"
  | "unknown";

export interface PersistErrorView {
  kind: PersistErrorKind;
  title: string;
  message: string;
  violations?: Array<{ code: string; message: string }>;
}

export function classifyPersistError(
  status: number,
  body: unknown,
): PersistErrorView {
  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const errorText =
    typeof record.error === "string" ? record.error : "Request failed.";
  const violations = Array.isArray(record.violations)
    ? (record.violations as Array<{ code: string; message: string }>)
    : undefined;

  if (status === 503) {
    if (/APP_ACCESS_TOKEN/i.test(errorText) || /locked/i.test(errorText)) {
      return {
        kind: "locked",
        title: "Endpoint locked / unconfigured",
        message:
          "Route persistence is locked until APP_ACCESS_TOKEN is set in the Control Panel deployment environment.",
      };
    }
    return {
      kind: "backend_unavailable",
      title: "Backend environment unavailable",
      message:
        errorText ||
        "Foundry backend environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  if (status === 401) {
    return {
      kind: "unauthorized",
      title: "Unauthorized token",
      message:
        "The owner access token was rejected. Re-enter the token for this session — it is not saved to disk.",
    };
  }

  if (status === 422) {
    const codes = new Set((violations ?? []).map((v) => v.code));
    const needsConfirmation =
      codes.has("protected_operation") ||
      codes.has("destructive_unconfirmed") ||
      codes.has("public_private_crossing");
    if (needsConfirmation) {
      return {
        kind: "policy_confirmation",
        title: "Policy confirmation required",
        message:
          "This route needs an explicit owner confirmation before it can persist. Confirmations are never enabled automatically.",
        violations,
      };
    }
    return {
      kind: "invalid_route",
      title: "Invalid route",
      message: errorText || "The proposed route failed validation.",
      violations,
    };
  }

  if (status === 409) {
    return {
      kind: "conflict",
      title: "Correction conflict",
      message: errorText,
    };
  }

  return {
    kind: "unknown",
    title: `Persist failed (${status})`,
    message: errorText,
    violations,
  };
}
