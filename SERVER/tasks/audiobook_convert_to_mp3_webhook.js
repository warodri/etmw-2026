const crypto = require('crypto');
const config = require('../config');
const { informAdmins } = require('../workers/email');
const elevenLabsUtils = require('../workers/eleven_labs_utils');
const {
    getPendingTtsJob,
    removePendingTtsJob
} = require('../workers/tts-webhook-jobs');
const AudioBookConvertTask = require('./audiobook_convert_to_mp3');

const MAX_TIMESTAMP_DRIFT_SEC = 300;
const WEBHOOK_SECRET = String(
    process.env.TTS_WEBHOOK_SECRET ||
    config.TTS_WEBHOOK_SECRET ||
    config.SECRET_KEY ||
    ''
).trim();
const DEFAULT_TTS_BASE = 'https://entertomyworld.com/tunnel/tts';

function getHeader(req, key) {
    const value = req.headers?.[key.toLowerCase()];
    if (Array.isArray(value)) return String(value[0] || '');
    return String(value || '');
}

function parseSignature(raw) {
    const text = String(raw || '').trim();
    if (!text) return '';
    const parts = text.split(',').map(part => part.trim()).filter(Boolean);
    for (const part of parts) {
        if (part.startsWith('sha256=')) return part.slice('sha256='.length).trim();
        if (part.startsWith('v1=')) return part.slice('v1='.length).trim();
    }
    if (text.startsWith('sha256=')) return text.slice('sha256='.length).trim();
    if (text.startsWith('v1=')) return text.slice('v1='.length).trim();
    return text.trim();
}

function normalizeTimestampToSeconds(timestampRaw) {
    const value = Number.parseInt(String(timestampRaw || '').trim(), 10);
    if (!Number.isFinite(value) || value <= 0) return 0;
    // Accept milliseconds or seconds.
    if (value > 1_000_000_000_000) {
        return Math.floor(value / 1000);
    }
    return value;
}

function safeTimingCompareHex(actualHex, expectedHex) {
    const a = Buffer.from(String(actualHex || '').trim().toLowerCase(), 'utf8');
    const b = Buffer.from(String(expectedHex || '').trim().toLowerCase(), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

function safeTimingCompareBase64(actualB64, expectedB64) {
    try {
        const a = Buffer.from(String(actualB64 || '').trim(), 'base64');
        const b = Buffer.from(String(expectedB64 || '').trim(), 'base64');
        if (!a.length || !b.length || a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

function verifyWebhookSignature(req, rawBodyBuffer) {
    if (!WEBHOOK_SECRET) {
        throw new Error('TTS webhook secret is not configured');
    }

    const timestampHeader = getHeader(req, 'x-tts-webhook-timestamp');
    const signatureHeader = getHeader(req, 'x-tts-signature');
    const timestamp = normalizeTimestampToSeconds(timestampHeader);
    const receivedSignature = parseSignature(signatureHeader);

    if (!timestamp || !receivedSignature) {
        throw new Error('Missing webhook signature headers');
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestamp) > MAX_TIMESTAMP_DRIFT_SEC) {
        throw new Error('Webhook timestamp outside allowed drift');
    }

    const signedPayload = Buffer.concat([
        Buffer.from(`${timestamp}.`, 'utf8'),
        rawBodyBuffer
    ]);
    const expectedSignatureHex = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(signedPayload)
        .digest('hex');
    const expectedSignatureBase64 = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(signedPayload)
        .digest('base64');

    const matchesHex = safeTimingCompareHex(receivedSignature, expectedSignatureHex);
    const matchesBase64 = safeTimingCompareBase64(receivedSignature, expectedSignatureBase64);
    if (!matchesHex && !matchesBase64) {
        throw new Error('Invalid webhook signature');
    }
}

function parsePayload(rawBodyBuffer) {
    try {
        return JSON.parse(rawBodyBuffer.toString('utf8') || '{}');
    } catch (ex) {
        throw new Error(`Invalid webhook JSON: ${ex.message}`);
    }
}

async function processWebhookPayload(payload, pendingJob) {
    const status = String(payload?.status || '').toLowerCase();
    const queueId = String(payload?.queueId || pendingJob?.queueId || '').trim();
    const audiobookId = String(payload?.audiobookId || pendingJob?.audiobookId || '').trim();
    const chapterNumber = Number(payload?.chapterNumber || pendingJob?.chapterNumber || 0);

    console.log('[TTS_WEBHOOK] process start', {
        queueId,
        status,
        audiobookId,
        chapterNumber,
        hasPendingJob: Boolean(pendingJob),
        pendingKeys: pendingJob ? Object.keys(pendingJob) : []
    });

    if (!queueId) {
        throw new Error('Webhook payload missing queueId');
    }

    if (status === 'failed') {
        const errorMessage = String(payload?.error || 'Unknown error');
        const attemptCount = Number(payload?.attemptCount || 0);
        const maxAttempts = Number(payload?.maxAttempts || 0);
        await removePendingTtsJob(queueId);

        informAdmins(
            `ETMW TTS FAILED - Queue ${queueId}`,
            `Audiobook: ${audiobookId || 'N/D'}<br>` +
            `Chapter: ${chapterNumber || 'N/D'}<br>` +
            `Error: ${errorMessage}<br>` +
            `Attempts: ${attemptCount}/${maxAttempts}`
        );
        return;
    }

    if (status !== 'completed') {
        return;
    }

    if (!audiobookId || !chapterNumber || !pendingJob?.params) {
        throw new Error(`Missing pending conversion context for queueId ${queueId}`);
    }

    const destinationTtsServer = String(
        pendingJob.destinationTtsServer || payload?.destinationTtsServer || payload?.baseUrl || DEFAULT_TTS_BASE
    ).replace(/\/+$/, '');
    const pollUrl = payload?.pollUrl || pendingJob?.pollUrl || `/api/tts/${queueId}`;
    console.log('[TTS_WEBHOOK] polling audio', {
        queueId,
        destinationTtsServer,
        pollUrl
    });

    const audioBuffer = await elevenLabsUtils.pollTtsAudioUntilReady({
        queueId,
        pollUrl,
        baseUrl: destinationTtsServer,
        pollIntervalMs: 3000,
        timeoutMs: 10 * 60 * 1000
    });

    const finalized = await AudioBookConvertTask.finalizeQueuedChapterAudio({
        audiobookId,
        chapterNumber,
        params: pendingJob.params,
        audioBuffer,
        originalInputText: pendingJob.originalInputText || '',
        translated: Boolean(pendingJob.translated),
        shouldGenerateStory: false
    });

    await removePendingTtsJob(queueId);

    informAdmins(
        `ETMW TTS COMPLETED - Book ${audiobookId} Chapter ${chapterNumber}`,
        `Queue: ${queueId}<br>` +
        `Audio URL: ${finalized?.chapter?.url || 'N/D'}<br>` +
        `Duration: ${Number(finalized?.chapter?.durationSec || 0).toFixed(1)} sec`
    );
}

async function handleWebhookRequest(req, res) {
    try {
        const rawBodyBuffer = Buffer.isBuffer(req.rawBody)
            ? req.rawBody
            : Buffer.from(JSON.stringify(req.body || {}), 'utf8');

        console.log('[TTS_WEBHOOK] incoming request', {
            timestamp: getHeader(req, 'x-tts-webhook-timestamp'),
            signaturePreview: parseSignature(getHeader(req, 'x-tts-signature')).slice(0, 16),
            rawBodyBytes: rawBodyBuffer.length
        });

        verifyWebhookSignature(req, rawBodyBuffer);
        const payload = parsePayload(rawBodyBuffer);
        const queueId = String(payload?.queueId || '').trim();
        const pendingJob = queueId ? await getPendingTtsJob(queueId) : null;
        console.log('[TTS_WEBHOOK] signature ok + payload parsed', {
            queueId,
            status: payload?.status,
            audiobookId: payload?.audiobookId,
            chapterNumber: payload?.chapterNumber,
            hasPendingJob: Boolean(pendingJob)
        });

        res.status(200).json({ success: true });

        setImmediate(async () => {
            try {
                await processWebhookPayload(payload, pendingJob);
                console.log('[TTS_WEBHOOK] async processing finished', {
                    queueId,
                    status: payload?.status
                });
            } catch (ex) {
                console.log('TTS webhook async processing error:', ex.message);
                if (queueId) {
                    informAdmins(
                        `ETMW TTS WEBHOOK PROCESSING ERROR - Queue ${queueId}`,
                        `Error: ${ex.message}`
                    );
                }
            }
        });
    } catch (ex) {
        return res.status(401).json({
            success: false,
            message: ex.message || 'Invalid webhook'
        });
    }
}

async function run(data, req, res) {
    return handleWebhookRequest(req, res);
}

module.exports = {
    run,
    handleWebhookRequest
};
