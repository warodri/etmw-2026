const OpenAI = require('openai');
const config = require('../config');

const DEFAULT_MODEL = 'gpt-4.1-mini';
const MAX_MEMORY_CONTEXT_CHARS = 12000;

function getClient() {
    return new OpenAI({ apiKey: config.OPEN_AI.API_KEY });
}

function safeParseJson(raw) {
    if (!raw || typeof raw !== 'string') {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (ex) {
        // Try to extract JSON object if model wrapped it in markdown/code fences.
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(raw.slice(start, end + 1));
            } catch (innerEx) {
                return null;
            }
        }
        return null;
    }
}

function normalizeChapterPayload(raw, chapterNumber, modelName) {
    const content = String(raw?.content || '').trim();
    const summary = String(raw?.summary || '').trim();

    return {
        chapterNumber,
        title: String(raw?.title || `Chapter ${chapterNumber}`).trim(),
        summary: summary || '',
        content,
        characterProgression: String(raw?.characterProgression || '').trim(),
        hooksForNextChapter: String(raw?.hooksForNextChapter || '').trim(),
        wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
        aiModelUsed: modelName || DEFAULT_MODEL,
    };
}

function normalizeCharacters(rawCharacters) {
    if (!Array.isArray(rawCharacters)) {
        return [];
    }

    return rawCharacters
        .map((item) => {
            if (typeof item === 'string') {
                return {
                    name: String(item).trim(),
                    age: '',
                    role: '',
                    personality: '',
                    internalConflict: '',
                    externalGoal: '',
                };
            }

            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                name: String(item.name || '').trim(),
                age: String(item.age || '').trim(),
                role: String(item.role || '').trim(),
                personality: String(item.personality || '').trim(),
                internalConflict: String(item.internalConflict || '').trim(),
                externalGoal: String(item.externalGoal || '').trim(),
            };
        })
        .filter((item) => item && item.name);
}

function fallbackMemorySummary(chapterText, chapterNumber) {
    const words = String(chapterText || '').split(/\s+/).filter(Boolean);
    const trimmed = words.slice(0, 220).join(' ');
    return `Chapter ${chapterNumber}: ${trimmed}`.trim();
}

function buildCondensedMemoryBlock(memories, maxChars = MAX_MEMORY_CONTEXT_CHARS) {
    const lines = (Array.isArray(memories) ? memories : [])
        .filter(item => item && item.enabled !== false)
        .sort((a, b) => Number(a.chapterNumber || 0) - Number(b.chapterNumber || 0))
        .map(item => {
            const chapterNumber = Number(item.chapterNumber || 0);
            const memory = String(item.memory || '').trim();
            return {
                chapterNumber,
                text: `[Chapter ${chapterNumber}] ${memory}`,
            };
        })
        .filter(item => item.text.length > 0);

    while (lines.length > 0 && lines.join('\n\n').length > maxChars) {
        lines.shift();
    }

    return lines.map(item => item.text).join('\n\n');
}

function getMissingBlueprintFields(blueprint) {
    const b = blueprint || {};
    const missing = [];

    if (!String(b.mainConflict || '').trim()) missing.push('mainConflict');
    if (!String(b.longTermArc || '').trim()) missing.push('longTermArc');
    if (!String(b.worldRules || '').trim()) missing.push('worldRules');

    const hasCharacters = Array.isArray(b.characters) && b.characters.length > 0;
    if (!hasCharacters) missing.push('characters');

    return missing;
}

async function openAiEnrichBlueprint({ blueprint, condensedMemory }) {
    const missingFields = getMissingBlueprintFields(blueprint);
    if (missingFields.length === 0) {
        return {
            updated: false,
            blueprintPatch: {},
            missingFields: [],
        };
    }

    const openAiClient = getClient();
    const completion = await openAiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: 'Fill missing story blueprint fields. Return strict JSON only.'
            },
            {
                role: 'user',
                content: JSON.stringify({
                    instructions: 'Generate missing blueprint fields with continuity-safe details.',
                    requiredFields: ['mainConflict', 'longTermArc', 'worldRules', 'characters'],
                    outputShape: {
                        mainConflict: 'string',
                        longTermArc: 'string',
                        worldRules: 'string',
                        characters: [
                            {
                                name: 'string',
                                age: 'string',
                                role: 'string',
                                personality: 'string',
                                internalConflict: 'string',
                                externalGoal: 'string'
                            }
                        ]
                    },
                    currentBlueprint: blueprint || {},
                    condensedMemory: condensedMemory || '',
                })
            }
        ],
    });

    const raw = completion?.choices?.[0]?.message?.content || '{}';
    const parsed = safeParseJson(raw) || {};

    const blueprintPatch = {};
    if (missingFields.includes('mainConflict')) blueprintPatch.mainConflict = String(parsed.mainConflict || '').trim();
    if (missingFields.includes('longTermArc')) blueprintPatch.longTermArc = String(parsed.longTermArc || '').trim();
    if (missingFields.includes('worldRules')) blueprintPatch.worldRules = String(parsed.worldRules || '').trim();
    if (missingFields.includes('characters')) blueprintPatch.characters = normalizeCharacters(parsed.characters);

    const updated = Object.keys(blueprintPatch).some((key) => {
        if (key === 'characters') return Array.isArray(blueprintPatch.characters) && blueprintPatch.characters.length > 0;
        return !!String(blueprintPatch[key] || '').trim();
    });

    return {
        updated,
        blueprintPatch,
        missingFields,
    };
}

async function openAiCreateChapter({
    storyRecord,
    chapterNumber,
    condensedMemory,
    regenerationInstructions,
}) {
    const openAiClient = getClient();

    const blueprint = storyRecord?.blueprint || {};

    const system = `
You are writing the next chapter of an audiobook series.

You MUST follow strictly the provided blueprint and prior-memory context.

RULES:
- Maintain character consistency.
- Maintain world rules.
- Respect long-term arc.
- Increase tension progressively.
- Do NOT contradict previous events.
- Keep prose optimized for spoken narration.
- Write with clear paragraph breaks.

OUTPUT FORMAT (strict JSON):
{
  "title": "",
  "summary": "",
  "content": "",
  "characterProgression": "",
  "hooksForNextChapter": ""
}

Avoid markdown wrappers and return JSON only.
`.trim();

    const user = {
        chapterNumber,
        blueprint,
        condensedMemory: condensedMemory || 'No prior chapters yet.',
        regenerationInstructions: String(regenerationInstructions || '').trim() || 'No extra instructions.',
    };

    const completion = await openAiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: JSON.stringify(user) },
        ],
    });

    const raw = completion?.choices?.[0]?.message?.content || '{}';
    const parsed = safeParseJson(raw) || {};

    return normalizeChapterPayload(parsed, chapterNumber, completion?.model || DEFAULT_MODEL);
}

async function openAiSummarizeChapterMemory({
    storyRecord,
    chapterNumber,
    chapterText,
    chapterSummary,
    priorCondensedMemory,
}) {
    const openAiClient = getClient();

    const prompt = {
        storyTitle: storyRecord?.blueprint?.storyTitle || '',
        chapterNumber,
        priorCondensedMemory: priorCondensedMemory || '',
        chapterSummary: String(chapterSummary || ''),
        chapterText: String(chapterText || '').slice(0, 24000),
        instructions: 'Create around 200 words summarizing key events, character progression, unresolved threads, and continuity facts required for next chapters.'
    };

    const completion = await openAiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: 'Return strict JSON with a single field {"memory":"..."}. The memory should be about 200 words and continuity-focused.'
            },
            {
                role: 'user',
                content: JSON.stringify(prompt)
            }
        ],
    });

    const raw = completion?.choices?.[0]?.message?.content || '{}';
    const parsed = safeParseJson(raw) || {};
    const memory = String(parsed.memory || '').trim();

    if (memory) {
        return memory;
    }

    return fallbackMemorySummary(chapterText, chapterNumber);
}

module.exports = {
    openAiEnrichBlueprint,
    openAiCreateChapter,
    openAiSummarizeChapterMemory,
    buildCondensedMemoryBlock,
    MAX_MEMORY_CONTEXT_CHARS,
};
