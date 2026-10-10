import { Hono } from "hono";
import { Env } from "../types";

export const ImagesRoute = new Hono<{ Bindings: Env }>();

// In-memory cache for fast hits in the same worker isolate
const memoryStore = new Map<string, { data: Uint8Array; mime: string; created: number }>();

function cleanupMemoryStore() {
	if (memoryStore.size > 100) {
		const oldestKeys = Array.from(memoryStore.keys()).slice(0, 30);
		for (const k of oldestKeys) memoryStore.delete(k);
	}
}

/**
 * Stores an image and returns its public HTTP(S) URL.
 * Uses KV (if available), Cloudflare Cache API, and in-memory store.
 */
export async function storeImage(
	id: string,
	binary: Uint8Array,
	mime: string,
	env: Env,
	origin: string
): Promise<string> {
	memoryStore.set(id, { data: binary, mime, created: Date.now() });
	cleanupMemoryStore();

	const imageUrl = `${origin}/images/${id}.jpg`;

	// Cache in Cloudflare Edge Cache API
	try {
		if (typeof caches !== "undefined" && caches?.default) {
			const cacheResponse = new Response(binary, {
				headers: {
					"Content-Type": mime,
					"Cache-Control": "public, max-age=86400",
					"Access-Control-Allow-Origin": "*"
				}
			});
			await caches.default.put(imageUrl, cacheResponse.clone());
		}
	} catch (e) {
		console.warn("[Images] Edge cache put warning:", e);
	}

	// Persist to Cloudflare KV with 24-hour TTL if configured
	if (env.IMAGE_KV) {
		try {
			await env.IMAGE_KV.put(id, binary, { expirationTtl: 86400 });
		} catch (e) {
			console.warn("[Images] KV put warning:", e);
		}
	}

	return imageUrl;
}

ImagesRoute.get("/:id", async (c) => {
	const rawId = c.req.param("id");
	const id = rawId.replace(/\.[a-zA-Z0-9]+$/, "");
	const reqUrl = c.req.url;

	// 1. Try Cloudflare Edge Cache API
	try {
		if (typeof caches !== "undefined" && caches?.default) {
			const cached = await caches.default.match(reqUrl);
			if (cached) return cached;

			const cleanUrl = new URL(`/images/${id}.jpg`, reqUrl).toString();
			const altCached = await caches.default.match(cleanUrl);
			if (altCached) return altCached;
		}
	} catch (e) {
		console.warn("[Images] Edge cache match error:", e);
	}

	// 2. Try in-memory store
	const mem = memoryStore.get(id);
	if (mem) {
		return new Response(mem.data, {
			headers: {
				"Content-Type": mem.mime,
				"Cache-Control": "public, max-age=86400",
				"Access-Control-Allow-Origin": "*"
			}
		});
	}

	// 3. Try Cloudflare KV
	if (c.env.IMAGE_KV) {
		try {
			const kvBuf = await c.env.IMAGE_KV.get(id, "arrayBuffer");
			if (kvBuf) {
				return new Response(kvBuf, {
					headers: {
						"Content-Type": "image/jpeg",
						"Cache-Control": "public, max-age=86400",
						"Access-Control-Allow-Origin": "*"
					}
				});
			}
		} catch (e) {
			console.warn("[Images] KV read error:", e);
		}
	}

	return c.text("Image not found or expired", 404);
});
