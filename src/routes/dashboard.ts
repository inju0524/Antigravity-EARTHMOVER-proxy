import { Hono } from "hono";
import { Env } from "../types";
import { trafficLogger } from "../traffic-logger";
import { AuthManager } from "../auth";
import { GeminiApiClient } from "../gemini-client";
import { getDashboardHtml } from "../views/dashboard-html";

export const DashboardRoute = new Hono<{ Bindings: Env }>();

// 1. Serve SPA HTML UI
DashboardRoute.get("/", (c) => {
	const html = getDashboardHtml();
	return c.html(html);
});

// 2. Fetch traffic logs
DashboardRoute.get("/api/logs", (c) => {
	const limit = Number(c.req.query("limit") || 100);
	const offset = Number(c.req.query("offset") || 0);
	const query = c.req.query("q") || "";
	const account = c.req.query("account") || "";
	const status = c.req.query("status") || "";

	const result = trafficLogger.getLogs(limit, offset, query, account, status);
	const accounts = trafficLogger.getAccounts();

	return c.json({
		...result,
		accounts
	});
});

// 3. Fetch single log detail
DashboardRoute.get("/api/logs/:id", (c) => {
	const id = c.req.param("id");
	const log = trafficLogger.getLogById(id);
	if (!log) return c.json({ error: "Log not found" }, 404);
	return c.json(log);
});

// 4. Toggle recording
DashboardRoute.post("/api/recording", async (c) => {
	const body = await c.req.json<{ recording: boolean }>();
	trafficLogger.setRecording(!!body.recording);
	return c.json({ recording: trafficLogger.isRecording() });
});

// 5. Clear all logs
DashboardRoute.delete("/api/logs", (c) => {
	trafficLogger.clearLogs();
	return c.json({ ok: true, message: "Logs cleared" });
});

// 6. Fetch accounts status
DashboardRoute.get("/api/accounts", async (c) => {
	try {
		const authManager = new AuthManager(c.env);
		const accounts = await authManager.getAllAccountsStatus();
		return c.json({ ok: true, accounts });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return c.json({ ok: false, error: msg }, 500);
	}
});

// 7. Single step test runner
DashboardRoute.post("/api/test-run", async (c) => {
	const startTime = Date.now();
	try {
		const body = await c.req.json<{ model?: string; prompt?: string; reasoning_effort?: string }>();
		const model = body.model || "gemini-3.8-flash-high";
		const prompt = body.prompt || "Hello! Please do a quick self-check.";
		const reasoning_effort = body.reasoning_effort || "high";

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth(model);
		const geminiClient = new GeminiApiClient(c.env, authManager);

		const completion = await geminiClient.getCompletion(
			model,
			"You are an AI assistant under test.",
			[{ role: "user", content: prompt }],
			{
				includeReasoning: reasoning_effort !== "none",
				reasoning_effort: (reasoning_effort as any) || "high"
			}
		);

		const durationMs = Date.now() - startTime;
		const accountEmail = await authManager.getCurrentAccountEmail();

		const logItem = {
			id: `log_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
			timestamp: new Date().toISOString(),
			timeStr: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
			status: 200,
			method: "POST",
			path: "/v1/chat/completions (test-run)",
			model,
			protocol: "OpenAI" as const,
			account: accountEmail,
			durationMs,
			tokens: {
				input: completion.usage?.inputTokens ?? 0,
				output: completion.usage?.outputTokens ?? 0,
				total: (completion.usage?.inputTokens ?? 0) + (completion.usage?.outputTokens ?? 0)
			},
			request: {
				headers: { "Content-Type": "application/json" },
				body: { model, prompt, reasoning_effort }
			},
			response: {
				headers: { "Content-Type": "application/json" },
				body: completion
			}
		};

		trafficLogger.addLog(logItem);

		return c.json({
			ok: true,
			durationMs,
			model,
			account: accountEmail,
			completion,
			tokens: logItem.tokens
		});
	} catch (e: unknown) {
		const durationMs = Date.now() - startTime;
		const msg = e instanceof Error ? e.message : String(e);

		const logItem = {
			id: `log_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
			timestamp: new Date().toISOString(),
			timeStr: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
			status: 500,
			method: "POST",
			path: "/v1/chat/completions (test-run)",
			model: "test-model",
			protocol: "OpenAI" as const,
			account: "unknown",
			durationMs,
			tokens: { input: 0, output: 0, total: 0 },
			request: { headers: {}, body: {} },
			response: { headers: {}, body: { error: msg } }
		};

		trafficLogger.addLog(logItem);

		return c.json({ ok: false, durationMs, error: msg }, 500);
	}
});
