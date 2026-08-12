import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Home from "../page";

const WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";
const ROUTE_ID = "22222222-2222-4222-8222-222222222222";

async function routeATask(task = "Implement the Foundry routing inbox UI") {
  fireEvent.change(screen.getByLabelText(/task \/ idea \/ request/i), {
    target: { value: task },
  });
  fireEvent.click(screen.getByRole("button", { name: /route task/i }));
  await waitFor(() => {
    expect(screen.getByText("Foundry persistence")).toBeInTheDocument();
    expect(screen.getByLabelText(/intent \(verbatim\)/i)).toHaveValue(task);
  });
}

describe("Foundry persistence intake UI", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/route/persist")) {
          return new Response(
            JSON.stringify({
              routedRequest: {
                id: ROUTE_ID,
                intent: "Implement the Foundry routing inbox UI",
              },
              workspace: { id: WORKSPACE_ID, name: "Legacy Codex" },
              actionId: "33333333-3333-4333-8333-333333333333",
              eventLogged: true,
              evidence: {
                status: "pending",
                claim: "Verify completion",
                provenance: "unknown",
              },
              corrected: null,
              warnings: [],
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          );
        }
        // Force doctrine fallback for /api/route
        return Promise.reject(new Error("offline"));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a proposed route after doctrine fallback routing", async () => {
    render(<Home />);
    await routeATask();
    expect(screen.getByText(/Doctrine fallback \(not AI-model routing\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/execution lane/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selected agent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/required evidence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provenance/i)).toHaveValue("inference");
  });

  it("labels doctrine fallback distinctly from AI-model routing", async () => {
    render(<Home />);
    await routeATask();
    expect(screen.getByText(/not AI-model routing/i)).toBeInTheDocument();
    expect(screen.queryByText(/^AI model routing$/i)).not.toBeInTheDocument();
  });

  it("shows inline validation violations for an invalid route", async () => {
    render(<Home />);
    await routeATask();
    fireEvent.change(screen.getByLabelText(/foundry workspace id/i), {
      target: { value: "not-a-uuid" },
    });
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: "test-token" },
    });
    fireEvent.click(screen.getByTestId("persist-submit"));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/invalid route/i);
    expect(alert.textContent).toMatch(/workspaceId/i);
  });

  it("keeps confirmations defaulted to false and never auto-enables them", async () => {
    render(<Home />);
    await routeATask("Delete production secrets and force-push main");
    expect(screen.getByTestId("confirm-protected")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByTestId("confirm-destructive")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByTestId("confirm-public")).toHaveAttribute(
      "aria-checked",
      "false",
    );

    fireEvent.change(screen.getByLabelText(/foundry workspace id/i), {
      target: { value: WORKSPACE_ID },
    });
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: "test-token" },
    });
    fireEvent.click(screen.getByTestId("persist-submit"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/policy confirmation required|protected|destructive/i);
    expect(screen.getByTestId("confirm-protected")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByTestId("confirm-destructive")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("renders pending evidence on successful persistence", async () => {
    render(<Home />);
    await routeATask();
    fireEvent.change(screen.getByLabelText(/foundry workspace id/i), {
      target: { value: WORKSPACE_ID },
    });
    // Sensitivity internal + unknown visibility may trip publicExposure;
    // set sensitivity public for a clean success path.
    fireEvent.change(screen.getByLabelText(/^sensitivity$/i), {
      target: { value: "public" },
    });
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: "test-token" },
    });
    fireEvent.click(screen.getByTestId("persist-submit"));

    const success = await screen.findByTestId("persist-success");
    expect(within(success).getByTestId("pending-evidence")).toHaveTextContent(
      "pending",
    );
    expect(success).toHaveTextContent(/event logged:\s*yes/i);
  });

  it("includes supersedesRequestId and correctionReason on corrections", async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/route/persist")) {
        return new Response(
          JSON.stringify({
            routedRequest: { id: "44444444-4444-4444-8444-444444444444" },
            workspace: { id: WORKSPACE_ID, name: "Legacy Codex" },
            actionId: null,
            eventLogged: true,
            evidence: { status: "pending", claim: "Verify correction" },
            corrected: ROUTE_ID,
            warnings: ["partial step warning"],
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      return Promise.reject(new Error("offline"));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);
    await routeATask();
    fireEvent.change(screen.getByLabelText(/foundry workspace id/i), {
      target: { value: WORKSPACE_ID },
    });
    fireEvent.change(screen.getByLabelText(/^sensitivity$/i), {
      target: { value: "public" },
    });
    fireEvent.change(screen.getByLabelText(/supersedes request id/i), {
      target: { value: ROUTE_ID },
    });
    fireEvent.change(screen.getByLabelText(/correction reason/i), {
      target: { value: "Wrong repository path for Foundry UI work" },
    });
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: "test-token" },
    });
    fireEvent.click(screen.getByTestId("persist-submit"));

    await screen.findByTestId("persist-success");
    const persistCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/api/route/persist"),
    );
    expect(persistCall).toBeTruthy();
    const body = JSON.parse(String(persistCall?.[1]?.body ?? "{}")) as Record<
      string,
      unknown
    >;
    expect(body.supersedesRequestId).toBe(ROUTE_ID);
    expect(body.correctionReason).toBe(
      "Wrong repository path for Foundry UI work",
    );
  });

  it("shows distinct actionable messages for 401, 422, and 503", async () => {
    const responses = [
      {
        status: 401,
        body: { error: "Unauthorized: owner access token required." },
      },
      {
        status: 422,
        body: {
          error: "Route proposal rejected.",
          violations: [
            { code: "unknown_repository", message: "Repository not known." },
          ],
        },
      },
      {
        status: 503,
        body: {
          error:
            "Route persistence is locked: set APP_ACCESS_TOKEN in the deployment environment.",
        },
      },
    ];
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        if (String(input).includes("/api/route/persist")) {
          const current = responses[call] ?? responses[responses.length - 1];
          call += 1;
          return new Response(JSON.stringify(current.body), {
            status: current.status,
            headers: { "Content-Type": "application/json" },
          });
        }
        return Promise.reject(new Error("offline"));
      }),
    );

    render(<Home />);
    await routeATask();
    fireEvent.change(screen.getByLabelText(/foundry workspace id/i), {
      target: { value: WORKSPACE_ID },
    });
    fireEvent.change(screen.getByLabelText(/^sensitivity$/i), {
      target: { value: "public" },
    });
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: "test-token" },
    });

    fireEvent.click(screen.getByTestId("persist-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/unauthorized token/i);

    fireEvent.click(screen.getByTestId("persist-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid route/i);

    fireEvent.click(screen.getByTestId("persist-submit"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /endpoint locked|unconfigured/i,
    );
  });

  it("never renders the secret token value after entry", async () => {
    render(<Home />);
    await routeATask();
    const secret = "super-secret-owner-token-value-xyz";
    fireEvent.change(screen.getByLabelText(/owner access token/i), {
      target: { value: secret },
    });
    fireEvent.click(screen.getByRole("button", { name: /hold token in session/i }));
    expect(screen.getByTestId("token-ready")).toBeInTheDocument();
    expect(screen.queryByDisplayValue(secret)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(secret);
  });
});
