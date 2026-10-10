import { normalizeModelId, resolveModel, buildExposedModelIds, isValidModel } from "../src/models";

// Simulated fetchAvailableModels dump mirroring the live instance.
// NOTE: the real upstream only exposes gemini-3.8-flash-tiered for the 3.8
// family (no standalone low/medium/high) — that is exactly the scenario the
// synthesized tier variants address.
const dynamicMap: Record<string, any> = {
	"gemini-3.8-flash-tiered": { model: "MODEL_PLACEHOLDER_M73", displayName: "Gemini 3.8 Flash (Tiered)", thinkingBudget: 4096 },
	"gemini-3.6-flash-low": { model: "MODEL_PLACEHOLDER_M200", displayName: "Gemini 3.6 Flash (Low)", thinkingBudget: 2048 },
	"gemini-3.6-flash-high": { model: "MODEL_PLACEHOLDER_M201", displayName: "Gemini 3.6 Flash (High)", thinkingBudget: 16384 },
	"gemini-3.1-pro-low": { model: "MODEL_PLACEHOLDER_M300", displayName: "Gemini 3.1 Pro (Low)", thinkingBudget: 2048 },
	"gemini-3.1-pro-high": { model: "MODEL_PLACEHOLDER_M301", displayName: "Gemini 3.1 Pro (High)", thinkingBudget: 16384 },
	"gemini-3-flash": { model: "MODEL_PLACEHOLDER_M132", displayName: "Gemini 3 Flash", thinkingBudget: 10000 },
	"claude-opus-4-6-thinking": { model: "MODEL_PLACEHOLDER_M26", displayName: "Claude Opus 4.6 (Thinking)", thinkingBudget: 1024 },
	"claude-sonnet-4-6-thinking": { model: "MODEL_PLACEHOLDER_M35", displayName: "Claude Sonnet 4.6 (Thinking)", thinkingBudget: 1024 },
	"gpt-oss-120b-medium": { model: "MODEL_OPENAI_GPT_OSS_120B_MEDIUM", displayName: "GPT-OSS 120B (Medium)", thinkingBudget: 8192 },
	"gemini-3.5-flash-deprecated": { model: "MODEL_PLACEHOLDER_M37", displayName: "Gemini 3.5 Flash (Medium)", thinkingBudget: 4000 },
	"gemini-3.5-flash-medium": { model: "MODEL_PLACEHOLDER_M20", displayName: "Gemini 3.5 Flash (Medium)", thinkingBudget: 4000 },
	"chat_internal": { model: "X", displayName: "Chat Internal" },
	"gemini-image-gen": { model: "Y", displayName: "Gemini Image Gen" }
};

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
	const ok = JSON.stringify(actual) === JSON.stringify(expected);
	if (!ok) {
		failures++;
		console.error(`FAIL ${name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
	} else {
		console.log(`ok   ${name}`);
	}
}

// normalizeModelId
check("normalize display high", normalizeModelId("Gemini 3.8 Flash (High)"), "gemini-38-flash-high");
check("normalize id", normalizeModelId("gemini-3.8-flash-high"), "gemini-38-flash-high");
check("normalize claude", normalizeModelId("Claude Sonnet 4.6 (Thinking)"), "claude-sonnet-46-thinking");

// resolveModel: display names
check("resolve display high", resolveModel("Gemini 3.8 Flash (High)", dynamicMap)?.id, "gemini-3.8-flash-tiered");
check("resolve display medium", resolveModel("Gemini 3.8 Flash (Medium)", dynamicMap)?.id, "gemini-3.8-flash-tiered");
check("resolve display low", resolveModel("Gemini 3.8 Flash (Low)", dynamicMap)?.id, "gemini-3.8-flash-tiered");
check("resolve tiered", resolveModel("gemini-3.8-flash-tiered", dynamicMap)?.id, "gemini-3.8-flash-tiered");
check("resolve 3.6 high", resolveModel("gemini-3.6-flash-high", dynamicMap)?.id, "gemini-3.6-flash-high");
check("resolve claude display", resolveModel("Claude Sonnet 4.6 (Thinking)", dynamicMap)?.id, "claude-sonnet-4-6-thinking");
check("resolve gpt display", resolveModel("GPT-OSS 120B (Medium)", dynamicMap)?.id, "gpt-oss-120b-medium");

// enum + budget propagation
const r = resolveModel("gemini-3.8-flash-high", dynamicMap);
check("enum for 3.8 high", r?.modelEnum, "MODEL_PLACEHOLDER_M73");
check("budget for 3.8 high", r?.thinkingBudget, 4096);

// deprecated M37 skipped in favour of the live M20 entry
check("skip deprecated M37", resolveModel("Gemini 3.5 Flash (Medium)", dynamicMap)?.modelEnum, "MODEL_PLACEHOLDER_M20");

// bare family aliases
check("bare 3.8 alias", resolveModel("gemini-3.8-flash", dynamicMap)?.id, "gemini-3.8-flash-tiered");
check("bare gpt alias", resolveModel("gpt-oss-120b", dynamicMap)?.id, "gpt-oss-120b-medium");

// unknown model
check("unknown returns null", resolveModel("gemini-9.9-ultra", dynamicMap), null);

// static-only fallback (no dynamic map)
check("static fallback", resolveModel("gemini-2.5-flash", null)?.id, "gemini-2.5-flash");

// buildExposedModelIds
const ids = buildExposedModelIds(dynamicMap);
for (const expected of ["gemini-3.8-flash-high", "gemini-3.8-flash-low", "gemini-3.8-flash-medium", "gemini-3.8-flash-tiered", "Gemini 3.8 Flash (Tiered)", "claude-sonnet-46-thinking"]) {
	check(`exposes ${expected}`, ids.includes(expected), true);
}
check("filters chat_", ids.includes("chat_internal") || ids.includes("Chat Internal"), false);
check("filters image", ids.some((i) => i.toLowerCase().includes("image")), false);

// static fallback list
const staticIds = buildExposedModelIds(null);
check("static list has 3.8 high", staticIds.includes("gemini-3.8-flash-high"), true);

// isValidModel
check("isValidModel alias", isValidModel("Gemini 3.8 Flash (High)"), true);
check("isValidModel unknown", isValidModel("nope-9000"), false);

// Synthesized tier variants: 3.8 family only has a "tiered" upstream model,
// so effort variants must route to it with a forced thinkingLevel.
const synHigh = resolveModel("gemini-3.8-flash-high", dynamicMap);
check("synth 3.8 high routes to tiered", synHigh?.id, "gemini-3.8-flash-tiered");
check("synth 3.8 high forces level", synHigh?.forcedThinkingLevel, "high");
const synLow = resolveModel("gemini-3.8-flash-low", dynamicMap);
check("synth 3.8 low routes to tiered", synLow?.id, "gemini-3.8-flash-tiered");
check("synth 3.8 low forces level", synLow?.forcedThinkingLevel, "low");
const synMed = resolveModel("Gemini 3.8 Flash (Medium)", dynamicMap);
check("synth 3.8 medium display routes to tiered", synMed?.id, "gemini-3.8-flash-tiered");
check("synth 3.8 medium forces level", synMed?.forcedThinkingLevel, "high");
check("synth keeps upstream enum", synHigh?.modelEnum, "MODEL_PLACEHOLDER_M73");

// Real upstream variants must NOT be overridden by synthesis (3.6 has real entries)
const real36 = resolveModel("gemini-3.6-flash-high", dynamicMap);
check("real 3.6 high not synthesized", real36?.id, "gemini-3.6-flash-high");
check("real 3.6 high no forced level", real36?.forcedThinkingLevel, undefined);

// Synthesized variants are exposed in /models
for (const v of ["gemini-3.8-flash-high", "gemini-3.8-flash-low", "gemini-3.8-flash-medium"]) {
	check(`exposes synth ${v}`, buildExposedModelIds(dynamicMap).includes(v), true);
}

// Synthesis works without a dynamic map too (static fallback)
const synStatic = resolveModel("gemini-3.8-flash-high", null);
check("synth static fallback routes to tiered", synStatic?.id, "gemini-3.8-flash-tiered");
check("synth static fallback forces level", synStatic?.forcedThinkingLevel, "high");

if (failures > 0) {
	console.error(`\n${failures} test(s) failed`);
	process.exit(1);
}
console.log("\nAll tests passed");
