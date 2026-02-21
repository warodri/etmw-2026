const Audiobook = require('../models/audiobook');
const Author = require('../models/author');

function toArray(value) {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

function cleanList(value) {
    return toArray(value).filter((item) => {
        if (item === null || item === undefined) return false;
        return String(item).trim() !== '';
    });
}

function parseIntSafe(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeAudiobook(doc) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    const audioFiles = Array.isArray(obj.audioFiles) ? obj.audioFiles : [];
    return {
        ...obj,
        audioFiles: audioFiles.map((file) => ({
            chapter: file.chapter,
            durationSec: file.durationSec
        }))
    };
}

async function applyCommonFilters(mongoQuery, data, req) {
    const { published, pipelineStatus, myAudiobooks } = data || {};

    if (published !== undefined && published !== null) {
        mongoQuery.published = published;
    }

    if (pipelineStatus !== undefined && pipelineStatus !== null) {
        const pipelineList = cleanList(pipelineStatus);
        if (pipelineList.length > 0) {
            mongoQuery.pipelineStatus = { $in: pipelineList };
        }
    }

    if (myAudiobooks) {
        const userId = req.userId || null;
        if (!userId) {
            return { ok: false, reason: 'invalid data' };
        }

        const author = await Author.findOne({
            userId,
            enabled: true
        });

        if (!author) {
            return { ok: true, forceEmpty: true };
        }

        if (mongoQuery.authorId && mongoQuery.authorId.$in) {
            mongoQuery.authorId.$in = mongoQuery.authorId.$in.filter(
                (id) => String(id) === String(author._id)
            );
            if (mongoQuery.authorId.$in.length === 0) {
                return { ok: true, forceEmpty: true };
            }
        } else {
            mongoQuery.authorId = author._id;
        }
    }

    return { ok: true };
}

async function runFindWithQuery(mongoQuery, data) {
    const limit = parseIntSafe(data?.limit, 50);
    const skip = parseIntSafe(data?.skip, 0);

    const records = await Audiobook.find(mongoQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

    const audiobooks = records.map((record) => sanitizeAudiobook(record));
    const total = await Audiobook.countDocuments(mongoQuery);
    const hasMore = (skip + audiobooks.length) < total;

    return {
        success: true,
        audiobooks,
        hasMore
    };
}

function unexpectedError(res, ex, filename) {
    console.log('UNEXPECTED ERROR IN FILE: ' + filename);
    console.log(ex.message);
    return res.status(200).json({
        success: false,
        message: 'Unexpected error'
    });
}

module.exports = {
    Audiobook,
    cleanList,
    escapeRegex,
    sanitizeAudiobook,
    applyCommonFilters,
    runFindWithQuery,
    unexpectedError
};

