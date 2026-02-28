const fs = require("fs").promises;
const path = require("path");
const { setTimeout: sleep } = require("timers/promises");

const DEFAULT_BASE_URL = "https://amir-tubby-ivey.ngrok-free.dev";
const DEFAULT_POLL_INTERVAL_MS = 3000;
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const VALID_STYLES = new Set([
    "Documentary",
    "Essay",
    "Fiction",
    "Thriller",
    "Calm",
    "Dramatic"
]);

function getAudioExtensionFromUrlOrType(audioUrl, contentType) {
    const fromUrl = String(audioUrl || "").toLowerCase();
    if (fromUrl.endsWith(".wav")) return ".wav";
    if (fromUrl.endsWith(".mp3")) return ".mp3";

    const ct = String(contentType || "").toLowerCase();
    if (ct.includes("audio/wav") || ct.includes("audio/x-wav")) return ".wav";
    if (ct.includes("audio/mpeg") || ct.includes("audio/mp3")) return ".mp3";
    return ".wav";
}

/**
 * Process text to speech using the Enter To My World TTS service.
 * @param {string} audiobookId - Audiobook id.
 * @param {number} chapterNumber - Chapter number to generate.
 * @param {Object} params - Request parameters.
 * @param {string} params.referenceAudioUrl - Remote URL to the reference voice sample (.wav or .mp3).
 * @param {string} params.text - Chapter text to convert.
 * @param {string} [params.language='en'] - Language code.
 * @param {string} [params.narrationStyle='Essay'] - Narration style: Documentary|Essay|Fiction|Thriller|Calm|Dramatic
 * @param {string} [params.baseUrl] - TTS API base url.
 * @param {number} [params.pollIntervalMs=3000] - Poll wait interval.
 * @param {number} [params.timeoutMs=900000] - Max wait time for completion.
 * @returns {Promise<Object>} Metadata for generated chapter audio.
 */
async function ttsEnterToMyWorld(audiobookId, chapterNumber, params = {}) {
    const {
        referenceAudioUrl,
        text,
        language = "en",
        narrationStyle = "Essay",
        baseUrl = DEFAULT_BASE_URL,
        pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
        timeoutMs = DEFAULT_TIMEOUT_MS
    } = params;

    if (!audiobookId) {
        throw new Error("audiobookId is required");
    }
    if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
        throw new Error("chapterNumber must be an integer >= 1");
    }
    if (!referenceAudioUrl) {
        throw new Error("referenceAudioUrl is required");
    }
    if (!text || !String(text).trim()) {
        throw new Error("text is required");
    }
    if (!VALID_STYLES.has(narrationStyle)) {
        throw new Error(`Invalid narrationStyle "${narrationStyle}"`);
    }

    // 1) Download remote reference audio first.
    const referenceResponse = await fetch(referenceAudioUrl);
    if (!referenceResponse.ok) {
        throw new Error(`Failed to download reference audio: ${referenceResponse.status}`);
    }

    const referenceContentType = referenceResponse.headers.get("content-type");
    const referenceExt = getAudioExtensionFromUrlOrType(referenceAudioUrl, referenceContentType);
    if (referenceExt !== ".wav" && referenceExt !== ".mp3") {
        throw new Error("Reference audio must be .wav or .mp3");
    }

    const referenceArrayBuffer = await referenceResponse.arrayBuffer();
    const referenceBuffer = Buffer.from(referenceArrayBuffer);
    if (!referenceBuffer.length) {
        throw new Error("Reference audio download is empty");
    }

    // 2) Queue TTS job.
    const queueForm = new FormData();
    queueForm.append(
        "file",
        new Blob([referenceBuffer], { type: referenceContentType || "application/octet-stream" }),
        `reference${referenceExt}`
    );
    queueForm.append("text", String(text));
    queueForm.append("language", String(language || "en"));
    queueForm.append("narration_style", String(narrationStyle));

    const normalizedBaseUrl = String(baseUrl).replace(/\/+$/, "");
    const queueUrl = `${normalizedBaseUrl}/api/tts`;
    const queueResponse = await fetch(queueUrl, {
        method: "POST",
        body: queueForm
    });

    if (queueResponse.status !== 202) {
        const errText = await queueResponse.text().catch(() => "");
        throw new Error(`TTS queue failed (${queueResponse.status}): ${errText}`);
    }

    const queueData = await queueResponse.json();
    const queueId = queueData?.queueId;
    if (!queueId) {
        throw new Error("TTS queue response missing queueId");
    }

    const pollPath = queueData?.pollUrl || `/api/tts/${queueId}`;
    const pollUrl = pollPath.startsWith("http") ? pollPath : `${normalizedBaseUrl}${pollPath}`;

    // 3) Poll until output WAV is ready.
    const startedAt = Date.now();
    let outputBuffer = null;

    while (Date.now() - startedAt < timeoutMs) {
        const pollResponse = await fetch(pollUrl);
        const contentType = String(pollResponse.headers.get("content-type") || "").toLowerCase();

        if (pollResponse.status === 202) {
            await sleep(pollIntervalMs);
            continue;
        }

        if (pollResponse.status === 500 && contentType.includes("application/json")) {
            const failure = await pollResponse.json().catch(() => ({}));
            throw new Error(failure?.error || "TTS job failed");
        }

        if (pollResponse.status === 200 && contentType.includes("audio/wav")) {
            const outputArrayBuffer = await pollResponse.arrayBuffer();
            outputBuffer = Buffer.from(outputArrayBuffer);
            break;
        }

        const unexpected = await pollResponse.text().catch(() => "");
        throw new Error(`Unexpected poll response (${pollResponse.status}): ${unexpected}`);
    }

    if (!outputBuffer?.length) {
        throw new Error(`Timed out waiting for TTS output after ${timeoutMs}ms`);
    }

    // 4) Persist chapter WAV in the expected audiobook folder.
    const audiobookDir = path.resolve(__dirname, "..", "audiobooks", String(audiobookId));
    await fs.mkdir(audiobookDir, { recursive: true });

    const fileName = `chapter_${chapterNumber}.wav`;
    const localPath = path.join(audiobookDir, fileName);
    await fs.writeFile(localPath, outputBuffer);

    return {
        queueId,
        status: "completed",
        contentType: "audio/wav",
        bytes: outputBuffer.length,
        localPath,
        fileName
    };
}

module.exports = {
    ttsEnterToMyWorld
}
