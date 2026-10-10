import { Context, Next } from "hono";
import { Env, AppVariables } from "../types";
import { trafficLogger, TrafficLogItem, maskEmail } from "../traffic-logger";

/**
 * Logging middleware for request/response tracking.
 * Automatically records all traffic into the in-memory circular buffer
 * for inspection on the Web Dashboard.
 */
export const loggingMiddleware = async (
	c: Context<{ Bindings: Env; Variables: AppVariables }>,
	next: Next
) => {
	const path = c.req.path;
	const method = c.req.method;

	// Skip recording internal dashboard requests to avoid infinite logging loops
	if (path.startsWith("/dashboard") || path.startsWith("/api/dashboard")) {
		await next();
		return;
	}

	const startTime = Date.now();
	const logId = `log_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
	c.set("logId", logId);

	// Extract headers (mask sensitive tokens)
	const reqHeaders: Record<string, string> = {};
	for (const [k, v] of Object.entries(c.req.header())) {
		if (k.toLowerCase() === "authorization") {
			reqHeaders[k] = v.startsWith("Bearer ") ? "Bearer ***" : "***";
		} else {
			reqHeaders[k] = v;
		}
	}

	let reqBody: any = null;
	let model = "-";

	if (["POST", "PUT", "PATCH"].includes(method)) {
		try {
			const cloned = c.req.raw.clone();
			const text = await cloned.text();
			if (text) {
				try {
					reqBody = JSON.parse(text);
					if (reqBody && reqBody.model) {
						model = reqBody.model;
					}
				} catch {
					reqBody = text.length > 2000 ? text.slice(0, 2000) + "... [truncated]" : text;
				}
			}
		} catch {
			reqBody = "[unreadable]";
		}
	}

	// Determine protocol
	let protocol: TrafficLogItem["protocol"] = "other";
	if (path.startsWith("/v1/chat") || path.startsWith("/v1/models") || path.startsWith("/v1/audio")) {
		protocol = "OpenAI";
	} else if (path.startsWith("/sdapi")) {
		protocol = "sdapi";
	} else if (path.includes("warmup")) {
		protocol = "warmup";
	} else if (path.includes("responses")) {
		protocol = "responses";
	} else if (path.startsWith("/debug")) {
		protocol = "debug";
	}

	console.log(`[${new Date().toISOString()}] ${method} ${path} (Model: ${model}) - Started`);

	await next();

	const durationMs = Date.now() - startTime;
	const status = c.res.status;
	const resContentType = c.res.headers.get("Content-Type") || "";
	const isStream = resContentType.includes("text/event-stream");

	const resHeaders: Record<string, string> = {};
	c.res.headers.forEach((v, k) => {
		resHeaders[k] = v;
	});

	let resBody: any = null;
	const tokens = { input: 0, output: 0, total: 0 };

	if (!isStream) {
		try {
			const clonedRes = c.res.clone();
			const text = await clonedRes.text();
			if (text) {
				try {
					resBody = JSON.parse(text);
					if (resBody?.usage) {
						tokens.input = resBody.usage.prompt_tokens || 0;
						tokens.output = resBody.usage.completion_tokens || 0;
						tokens.total = resBody.usage.total_tokens || tokens.input + tokens.output;
					}
				} catch {
					resBody = text.length > 5000 ? text.slice(0, 5000) + "... [truncated]" : text;
				}
			}
		} catch {
			resBody = "[unreadable response]";
		}
	} else {
		resBody = { status: "Streaming response in progress..." };
	}

	const accountRaw = c.get("accountEmail");
	const account = maskEmail(accountRaw);

	const logItem: TrafficLogItem = {
		id: logId,
		timestamp: new Date().toISOString(),
		timeStr: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
		status,
		method,
		path,
		model,
		protocol,
		account,
		durationMs,
		tokens,
		request: {
			headers: reqHeaders,
			body: reqBody
		},
		response: {
			headers: resHeaders,
			body: resBody,
			isStream
		}
	};

	trafficLogger.addLog(logItem);

	console.log(
		`[${new Date().toISOString()}] ${method} ${path} - Finished ${status} (${durationMs}ms, in: ${tokens.input}, out: ${tokens.output})`
	);
};
