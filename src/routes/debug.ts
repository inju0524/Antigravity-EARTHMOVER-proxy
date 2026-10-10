import { Hono } from "hono";
import { Env } from "../types";
import { AuthManager } from "../auth";
import { GeminiApiClient } from "../gemini-client";
import { CODE_ASSIST_ENDPOINT, CODE_ASSIST_API_VERSION } from "../config";

/**
 * Debug and testing routes for troubleshooting authentication and API functionality.
 */
export const DebugRoute = new Hono<{ Bindings: Env }>();

// Check KV cache status
DebugRoute.get("/cache", async (c) => {
	return c.json({
		status: "error",
		message: "Not implemented in Multi-Account architecture"
	}, 501);
});

// Simple token test endpoint
DebugRoute.post("/token-test", async (c) => {
	try {
		console.log("Token test endpoint called");
		const authManager = new AuthManager(c.env);

		// Test authentication only
		await authManager.initializeAuth();
		console.log("Token test passed");

		return c.json({
			status: "ok",
			message: "Token authentication successful"
		});
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.error("Token test error:", e);
		return c.json(
			{
				status: "error",
				message: errorMessage
				// Removed stack trace for security
			},
			500
		);
	}
});

// Full functionality test endpoint
DebugRoute.post("/test", async (c) => {
	try {
		console.log("Test endpoint called");
		const authManager = new AuthManager(c.env);
		const geminiClient = new GeminiApiClient(c.env, authManager);

		// Test authentication
		await authManager.initializeAuth();
		console.log("Auth test passed");

		// Test project discovery
		const projectId = await geminiClient.discoverProjectId();
		console.log("Project discovery test passed");

		return c.json({
			status: "ok",
			message: "Authentication and project discovery successful",
			project_available: !!projectId
			// Removed actual projectId for security
		});
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.error("Test endpoint error:", e);
		return c.json(
			{
				status: "error",
				message: errorMessage
				// Removed stack trace and detailed error message for security
			},
			500
		);
	}
});

// Raw upstream model dump — shows EXACTLY what the official Antigravity
// Code Assist endpoint returns for this account, before any proxy-side
// filtering or aliasing. Useful to verify which variants Google exposes.
DebugRoute.get("/raw-models", async (c) => {
	try {
		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth();

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:fetchAvailableModels`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${authManager.getAccessToken()}`,
				"User-Agent": "antigravity/cli/1.0.2 windows/amd64"
			},
			body: "{}"
		});

		const text = await response.text();
		let parsed: unknown = text;
		try { parsed = JSON.parse(text); } catch { /* keep raw text */ }

		return c.json({
			upstream: `${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:fetchAvailableModels`,
			status: response.status,
			modelCount: (parsed as any)?.models ? Object.keys((parsed as any).models).length : null,
			raw: parsed
		}, response.status as any);
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		return c.json({ status: "error", message: errorMessage }, 500);
	}
});
