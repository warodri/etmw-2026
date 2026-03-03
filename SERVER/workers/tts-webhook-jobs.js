const fs = require('fs').promises;
const path = require('path');

const JOBS_DIR = path.join(__dirname, '..', 'data');
const JOBS_FILE = path.join(JOBS_DIR, 'tts_webhook_jobs.json');

async function readStore() {
    try {
        const raw = await fs.readFile(JOBS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.jobs && typeof parsed.jobs === 'object') {
            return parsed;
        }
    } catch (ex) {
        if (ex.code !== 'ENOENT') {
            console.log('tts-webhook-jobs read error:', ex.message);
        }
    }
    return { jobs: {} };
}

async function writeStore(store) {
    await fs.mkdir(JOBS_DIR, { recursive: true });
    await fs.writeFile(JOBS_FILE, JSON.stringify(store, null, 2), 'utf8');
}

async function registerPendingTtsJob(job) {
    const queueId = String(job?.queueId || '').trim();
    if (!queueId) throw new Error('queueId is required for registerPendingTtsJob');
    const store = await readStore();
    store.jobs[queueId] = {
        ...(store.jobs[queueId] || {}),
        ...job,
        queueId,
        updatedAt: Date.now()
    };
    await writeStore(store);
    return store.jobs[queueId];
}

async function getPendingTtsJob(queueId) {
    const key = String(queueId || '').trim();
    if (!key) return null;
    const store = await readStore();
    return store.jobs[key] || null;
}

async function removePendingTtsJob(queueId) {
    const key = String(queueId || '').trim();
    if (!key) return;
    const store = await readStore();
    delete store.jobs[key];
    await writeStore(store);
}

module.exports = {
    registerPendingTtsJob,
    getPendingTtsJob,
    removePendingTtsJob
};
