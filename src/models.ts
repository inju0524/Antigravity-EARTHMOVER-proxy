import { ModelInfo } from "./types";

// --- Gemini CLI Models Configuration ---
// Static fallback metadata. Dynamic discovery (fetchAvailableModels) is the
// source of truth at runtime; this table is used when discovery fails and to
// describe capabilities (media support, context window, thinking).
export const geminiCliModels: Record<string, ModelInfo> = {
	// --- Claude via Antigravity ---
	"claude-opus-4-6-thinking": {
		maxTokens: 64000,
		contextWindow: 1_000_000,
		supportsImages: true,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Claude 4.6 Opus via Antigravity",
		thinking: true
	},
	"claude-sonnet-4-6-thinking": {
		maxTokens: 64000,
		contextWindow: 200_000,
		supportsImages: true,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Claude 4.6 Sonnet via Antigravity",
		thinking: true
	},
	// --- Gemini 3.8 Flash family ---
	"gemini-3.8-flash-low": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.8 Flash (Low) via Antigravity",
		thinking: true
	},
	"gemini-3.8-flash-medium": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.8 Flash (Medium) via Antigravity",
		thinking: true
	},
	"gemini-3.8-flash-high": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.8 Flash (High) via Antigravity",
		thinking: true
	},
	"gemini-3.8-flash-tiered": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.8 Flash (Tiered) via Antigravity",
		thinking: true
	},
	// --- Gemini 3.6 Flash family ---
	"gemini-3.6-flash-low": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.6 Flash (Low) via Antigravity",
		thinking: true
	},
	"gemini-3.6-flash-medium": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.6 Flash (Medium) via Antigravity",
		thinking: true
	},
	"gemini-3.6-flash-high": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.6 Flash (High) via Antigravity",
		thinking: true
	},
	"gemini-3.6-flash-tiered": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.6 Flash (Tiered) via Antigravity",
		thinking: true
	},
	// --- Gemini 3.5 Flash family ---
	"gemini-3.5-flash-extra-low": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash Extra Low via Antigravity",
		thinking: true
	},
	"gemini-3.5-flash-medium": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash Medium via Antigravity",
		thinking: true
	},
	"gemini-3.5-flash-high": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash High via Antigravity",
		thinking: true
	},
	// --- Gemini 3.1 family ---
	"gemini-3.1-pro-low": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.1 Pro (Low) via Antigravity",
		thinking: true
	},
	"gemini-3.1-pro-high": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.1 Pro (High) via Antigravity",
		thinking: true
	},
	"gemini-3.1-flash-lite": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.1 Flash Lite via Antigravity",
		thinking: true
	},
	"gemini-3.1-flash-image": {
		maxTokens: 4096,
		contextWindow: 128_000,
		supportsImages: true,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.1 Flash Image generation model via Antigravity",
		thinking: false
	},
	// --- Gemini 3 Flash ---
	"gemini-3-flash": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3 Flash via Antigravity",
		thinking: true
	},
	// --- GPT-OSS ---
	"gpt-oss-120b": {
		maxTokens: 32000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "GPT-OSS 120B via Antigravity",
		thinking: false
	},
	"gpt-oss-120b-medium": {
		maxTokens: 32000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "GPT-OSS 120B (Medium) via Antigravity",
		thinking: true
	},
	// --- Legacy Gemini 2.5 / 3.x previews (kept for backward compatibility) ---
	"gemini-3.1-flash-lite-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.1 Flash Lite Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-3.1-pro-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.1 Pro Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-3-flash-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.0 Flash Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-pro": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Pro model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-flash": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Flash model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-flash-lite": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Flash Lite model via OAuth (free tier)",
		thinking: true
	}
};

// --- Default Model ---
export const DEFAULT_MODEL = "gemini-2.5-flash";

// --- Model ID Normalization & Resolution ---

/**
 * Normalizes any model identifier (display name or id) to a canonical
 * kebab-case slug. Examples:
 *   "Gemini 3.8 Flash (High)"   -> "gemini-3.8-flash-high"
 *   "gemini-3.8-flash-high"     -> "gemini-3.8-flash-high"
 *   "Claude Sonnet 4.6 (Thinking)" -> "claude-sonnet-4-6-thinking"
 *   "GPT-OSS 120B (Medium)"     -> "gpt-oss-120b-medium"
 */
export function normalizeModelId(modelId: string): string {
	return modelId
		.trim()
		.toLowerCase()
		.replace(/[()]/g, "") // drop parentheses: "flash (high)" -> "flash high"
		.replace(/[\s_]+/g, "-") // spaces/underscores -> dashes
		.replace(/\./g, "") // drop version dots so "3.8" and "3-8" compare equal
		.replace(/[^a-z0-9\-]/g, "") // strip anything unexpected
		.replace(/-+/g, "-") // collapse duplicate dashes
		.replace(/^-|-$/g, "");
}

/**
 * Known aliases that cannot be derived mechanically.
 * Maps a normalized alias to the normalized canonical id.
 */
/**
 * Known aliases that cannot be derived mechanically.
 * Keys are NORMALIZED (via normalizeModelId, so no dots); values are canonical
 * static-table ids (compared after their own normalization).
 */
const MODEL_ALIAS_MAP: Record<string, string> = {
	// "tiered" is the Antigravity auto-tiered routing variant; map bare family
	// names to their tiered/default variant where one exists.
	"gemini-38-flash": "gemini-3.8-flash-tiered",
	"gemini-36-flash": "gemini-3.6-flash-tiered",
	"gemini-35-flash": "gemini-3.5-flash-medium",
	"gemini-31-pro": "gemini-3.1-pro-high",
	"gemini-31-flash-lite": "gemini-3.1-flash-lite",
	"gpt-oss-120b": "gpt-oss-120b-medium",
	// Effort synonyms used by some clients
	"gemini-38-flash-extra-low": "gemini-3.8-flash-low",
	"gemini-36-flash-extra-low": "gemini-3.6-flash-low",
	"gemini-38-flash-lite": "gemini-3.8-flash-low",
	"gemini-36-flash-lite": "gemini-3.6-flash-low"
};

export interface DynamicModelEntry {
	model?: string;
	displayName?: string;
	thinkingBudget?: number;
	isInternal?: boolean;
	[key: string]: unknown;
}

export interface ResolvedModel {
	/** The key in the dynamic model map (or the requested id for static models) */
	id: string;
	/** The upstream model enum, e.g. "MODEL_PLACEHOLDER_M16" */
	modelEnum?: string;
	/** Thinking budget advertised by the upstream, if any */
	thinkingBudget?: number;
	/** The entry from the dynamic map, when resolution happened dynamically */
	dynamic?: DynamicModelEntry;
	/**
	 * Forced thinking level for synthesized variants of "-tiered" models
	 * (e.g. gemini-3.8-flash-high routes to the upstream tiered model but
	 * pins thinkingLevel to "high").
	 */
	forcedThinkingLevel?: "low" | "high";
}

// Thinking level carried by each synthesized tier variant
const TIER_VARIANT_LEVELS: Record<string, "low" | "high"> = {
	low: "low",
	medium: "high",
	high: "high"
};

/**
 * Restores dotted version numbers in a normalized id so exposed ids stay
 * readable. Only Anthropic-style names keep a dotted "4.6"; Google-style
 * ids use dashes throughout ("claude-opus-46-thinking" ->
 * "claude-opus-4.6-thinking", "gemini-38-flash" -> "gemini-3.8-flash").
 */
function denormalizeFamilyBase(base: string): string {
	return base.replace(/-(\d)(\d)(?=-|$)/, "-$1.$2");
}

/** Model families (by normalized base) that expose thinking-level variants. */
export const THINKING_VARIANT_FAMILIES = new Set(["gemini-36-flash", "gemini-37-flash", "gemini-38-flash"]);

/**
 * Preferred canonical id for a dynamic key. Upstream sometimes exposes the
 * same physical model under several keys (gemini-pro-agent vs
 * gemini-3.1-pro-high, claude-sonnet-4-6 vs claude-sonnet-4-6-thinking);
 * the kebab-case alias derived from the displayName is always prettier.
 */
function preferredCanonicalId(key: string, entry: DynamicModelEntry): string {
	if (entry.displayName) {
		return denormalizeFamilyBase(normalizeModelId(entry.displayName));
	}
	return denormalizeFamilyBase(normalizeModelId(key));
}

/**
 * If the requested id is an effort variant ("-<low|medium|high>") of a
 * "-tiered" family (e.g. "gemini-3.8-flash-high"), resolve it to the
 * family's upstream tiered model while forcing the corresponding
 * thinkingLevel. Returns null when the family is not a tiered family.
 */
function resolveSynthesizedTierVariant(
	normalizedRequest: string,
	dynamicMap: Record<string, DynamicModelEntry> | null
): ResolvedModel | null {
	const m = normalizedRequest.match(/^(.*)-(low|medium|high)$/);
	if (!m) return null;
	const familyBase = m[1];
	const level = TIER_VARIANT_LEVELS[m[2]];

	// Only synthesize when the family actually routes to a "-tiered" model
	const familyTarget = MODEL_ALIAS_MAP[familyBase];
	if (!familyTarget || !familyTarget.endsWith("-tiered")) return null;

	const tieredNormalized = normalizeModelId(familyTarget);

	// Prefer the live dynamic entry for the tiered model
	if (dynamicMap) {
		for (const [key, entry] of Object.entries(dynamicMap)) {
			if (normalizeModelId(key) === tieredNormalized || normalizeModelId(entry.displayName || "") === tieredNormalized) {
				return {
					id: key,
					modelEnum: entry.model,
					thinkingBudget: entry.thinkingBudget,
					dynamic: entry,
					forcedThinkingLevel: level
				};
			}
		}
	}

	// Fall back to the static tiered id
	return { id: familyTarget, forcedThinkingLevel: level };
}

/**
 * Resolves a user-supplied model id against the dynamic model map and the
 * static model table. Accepts dynamic keys ("gemini-3.8-flash-tiered"),
 * display names ("Gemini 3.8 Flash (High)") and kebab-case aliases
 * ("gemini-3.8-flash-high").
 *
 * Returns null when nothing matches.
 */
export function resolveModel(
	requestedId: string,
	dynamicMap: Record<string, DynamicModelEntry> | null
): ResolvedModel | null {
	if (!requestedId) return null;

	// 1. Exact dynamic key match
	if (dynamicMap && dynamicMap[requestedId]) {
		const entry = dynamicMap[requestedId];
		return { id: requestedId, modelEnum: entry.model, thinkingBudget: entry.thinkingBudget, dynamic: entry };
	}

	const normalizedRequest = normalizeModelId(requestedId);
	const aliased = MODEL_ALIAS_MAP[normalizedRequest] || normalizedRequest;
	// The alias values are canonical ids; normalize them too for comparison
	const aliasedNormalized = normalizeModelId(aliased);

	// 2. Exact static match — but if an alias points elsewhere, honour the
	// alias (it encodes the preferred variant, e.g. tiered/medium).
	// NOTE: when the upstream genuinely offers this exact variant in the
	// dynamic map, prefer it over any synthesized tier variant.
	const preNormalized = normalizeModelId(requestedId);
	const preAliased = MODEL_ALIAS_MAP[preNormalized];
	if (geminiCliModels[requestedId] && (!preAliased || preAliased === requestedId)) {
		// If the same id also exists dynamically, prefer the dynamic entry for enum/budget
		if (dynamicMap) {
			for (const [key, entry] of Object.entries(dynamicMap)) {
				if (normalizeModelId(key) === normalizedRequest || normalizeModelId(entry.displayName || "") === normalizedRequest) {
					return { id: key, modelEnum: entry.model, thinkingBudget: entry.thinkingBudget, dynamic: entry };
				}
			}
		}
		// Effort variants of a "-tiered" family (gemini-3.8-flash-high) take
		// priority over the static entry: they route to the upstream tiered
		// model with a forced thinkingLevel.
		const tierVariant = resolveSynthesizedTierVariant(normalizedRequest, dynamicMap);
		if (tierVariant) return tierVariant;
		return { id: requestedId };
	}

	// 3. Dynamic map: match by normalized key or normalized displayName
	if (dynamicMap) {
		let deprecatedMatch: ResolvedModel | null = null;
		for (const [key, entry] of Object.entries(dynamicMap)) {
			const normalizedKey = normalizeModelId(key);
			const normalizedDisplay = normalizeModelId(entry.displayName || "");
			if (normalizedKey === aliasedNormalized || normalizedDisplay === aliasedNormalized || normalizedKey === normalizedRequest || normalizedDisplay === normalizedRequest) {
				const resolved: ResolvedModel = {
					id: key,
					modelEnum: entry.model,
					thinkingBudget: entry.thinkingBudget,
					dynamic: entry
				};
				// Skip deprecated enums (e.g. M37) if a better match comes later
				if (entry.model === "MODEL_PLACEHOLDER_M37") {
					deprecatedMatch = deprecatedMatch || resolved;
					continue;
				}
				return resolved;
			}
		}
		if (deprecatedMatch) return deprecatedMatch;
	}

	// 4. Static table: match by normalized id (request or alias)
	for (const staticId of Object.keys(geminiCliModels)) {
		const normalizedStatic = normalizeModelId(staticId);
		if (normalizedStatic === aliasedNormalized || normalizedStatic === normalizedRequest) {
			// Effort variants of a "-tiered" family route to the tiered model
			// with a forced thinkingLevel, even without a dynamic map.
			const tierVariant = resolveSynthesizedTierVariant(normalizedRequest, dynamicMap);
			if (tierVariant) return tierVariant;
			return { id: staticId };
		}
	}

	return null;
}

/**
 * Builds the list of model ids to expose on /v1/models.
 *
 * Policy:
 * - One canonical kebab-case id per physical model (deduped across alias
 *   keys like gemini-pro-agent vs gemini-3.1-pro-high).
 * - Only the newest families (3.6/3.7/3.8) get thinking-level variants
 *   (-low/-medium/-high); older families expose a single id which the
 *   request path pins to the highest advertised thinking budget.
 * - Internal, tab-completion and image-generation entries are hidden.
 * Legacy ids still resolve via resolveModel(); they just aren't listed.
 */
export function buildExposedModelIds(dynamicMap: Record<string, DynamicModelEntry> | null): string[] {
	const ids = new Set<string>();

	if (dynamicMap && Object.keys(dynamicMap).length > 0) {
		for (const [key, entry] of Object.entries(dynamicMap)) {
			if (
				entry.isInternal === true ||
				key.startsWith("chat_") ||
				key.startsWith("tab_") ||
				(key.includes("image") && key !== "gemini-3.1-flash-image") ||
				(entry.displayName && entry.displayName.toLowerCase().includes("image") && key !== "gemini-3.1-flash-image")
			) {
				continue;
			}

			const canonical = key === "gemini-3.1-flash-image" ? "gemini-3.1-flash-image" : preferredCanonicalId(key, entry);
			ids.add(canonical);

			// Thinking-level variants only for the newest families
			const normalizedCanonical = normalizeModelId(canonical);
			if (normalizedCanonical.endsWith("-tiered")) {
				const familyBase = normalizedCanonical.replace(/-tiered$/, "");
				if (THINKING_VARIANT_FAMILIES.has(familyBase)) {
					const base = denormalizeFamilyBase(familyBase);
					for (const variant of Object.keys(TIER_VARIANT_LEVELS)) {
						ids.add(`${base}-${variant}`);
					}
				}
			}
		}
	} else {
		// Fallback to static table: dedupe aliases, same variant policy
		for (const id of Object.keys(geminiCliModels)) {
			const normalized = normalizeModelId(id);
			const aliased = MODEL_ALIAS_MAP[normalized];
			// Skip ids that are aliases of a preferred canonical entry
			if (aliased && aliased !== id && geminiCliModels[aliased]) continue;
			ids.add(id);
		}
	}

	return Array.from(ids).sort();
}

// --- Helper Functions ---
export function getModelInfo(modelId: string): ModelInfo | null {
	if (geminiCliModels[modelId]) return geminiCliModels[modelId];
	const normalized = normalizeModelId(modelId);
	const aliased = normalizeModelId(MODEL_ALIAS_MAP[normalized] || normalized);
	for (const [id, info] of Object.entries(geminiCliModels)) {
		const normalizedId = normalizeModelId(id);
		if (normalizedId === aliased || normalizedId === normalized) {
			return info;
		}
	}
	return null;
}

export function getAllModelIds(): string[] {
	return Object.keys(geminiCliModels);
}

export function isValidModel(modelId: string): boolean {
	if (modelId in geminiCliModels) return true;
	const normalized = normalizeModelId(modelId);
	const aliased = normalizeModelId(MODEL_ALIAS_MAP[normalized] || normalized);
	return Object.keys(geminiCliModels).some((id) => {
		const normalizedId = normalizeModelId(id);
		return normalizedId === normalized || normalizedId === aliased;
	});
}
