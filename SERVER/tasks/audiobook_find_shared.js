const Audiobook = require('../models/audiobook');
const Author = require('../models/author');
const User = require('../models/user');

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

function parseBaseLanguage(value) {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim().toLowerCase();
    if (!raw) return null;

    const token = raw.split(',')[0].split(';')[0].trim();
    if (!token) return null;

    const base = token.split('-')[0].trim();
    if (!/^[a-z]{2,3}$/.test(base)) return null;
    return base;
}

function parseLanguageFilterList(value) {
    return cleanList(value)
        .map((item) => parseBaseLanguage(item))
        .filter(Boolean);
}

function getUserLanguageCandidates(languages) {
    if (languages === null || languages === undefined) return [];

    if (Array.isArray(languages)) {
        return languages.flatMap((item) => getUserLanguageCandidates(item));
    }

    if (typeof languages === 'string') {
        return [languages];
    }

    if (typeof languages === 'object') {
        const preferredKeys = ['language', 'lang', 'locale', 'code', 'value'];
        const prioritized = preferredKeys
            .map((key) => languages[key])
            .filter((item) => item !== null && item !== undefined);

        if (prioritized.length > 0) {
            return prioritized.flatMap((item) => getUserLanguageCandidates(item));
        }

        return Object.values(languages)
            .filter((item) => item !== null && item !== undefined)
            .flatMap((item) => getUserLanguageCandidates(item));
    }

    return [];
}

async function resolvePreferredBaseLanguage(data, req) {
    if (Object.prototype.hasOwnProperty.call(req || {}, '_preferredBaseLanguage')) {
        return req._preferredBaseLanguage;
    }

    const directCandidates = [
        data?.lang,
        req?.body?.lang,
        req?.headers?.['accept-language']
    ];

    for (const candidate of directCandidates) {
        const base = parseBaseLanguage(candidate);
        if (base) {
            if (req) req._preferredBaseLanguage = base;
            return base;
        }
    }

    const userId = req?.userId || null;
    if (!userId) {
        if (req) req._preferredBaseLanguage = null;
        return null;
    }

    const user = await User.findById(userId).select({ languages: 1 });
    const candidates = getUserLanguageCandidates(user?.languages);
    for (const candidate of candidates) {
        const base = parseBaseLanguage(candidate);
        if (base) {
            if (req) req._preferredBaseLanguage = base;
            return base;
        }
    }

    if (req) req._preferredBaseLanguage = null;
    return null;
}

function buildPreferredLanguageFilter(baseLanguage) {
    if (!baseLanguage) return null;

    const languageRegex = new RegExp(`^${baseLanguage}(-|$)`, 'i');
    return {
        $or: [
            { targetLanguage: languageRegex },
            {
                $and: [
                    {
                        $or: [
                            { targetLanguage: null },
                            { targetLanguage: '' },
                            { targetLanguage: { $exists: false } }
                        ]
                    },
                    { sourceLanguage: languageRegex }
                ]
            }
        ]
    };
}

function buildExplicitLanguagesFilter(languages) {
    if (!Array.isArray(languages) || languages.length === 0) return null;

    const dedup = Array.from(new Set(languages));
    const regexes = dedup.map((baseLanguage) => new RegExp(`^${baseLanguage}(-|$)`, 'i'));

    return {
        $or: [
            { targetLanguage: { $in: regexes } },
            {
                $and: [
                    {
                        $or: [
                            { targetLanguage: null },
                            { targetLanguage: '' },
                            { targetLanguage: { $exists: false } }
                        ]
                    },
                    { sourceLanguage: { $in: regexes } }
                ]
            }
        ]
    };
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

    const requestedLanguages = parseLanguageFilterList(data?.languages);
    const explicitLanguagesFilter = buildExplicitLanguagesFilter(requestedLanguages);
    if (explicitLanguagesFilter) {
        mongoQuery.$and = mongoQuery.$and || [];
        mongoQuery.$and.push(explicitLanguagesFilter);
        return { ok: true };
    }

    const preferredBaseLanguage = await resolvePreferredBaseLanguage(data, req);
    const preferredLanguageFilter = buildPreferredLanguageFilter(preferredBaseLanguage);
    if (preferredLanguageFilter) {
        mongoQuery.$and = mongoQuery.$and || [];
        mongoQuery.$and.push(preferredLanguageFilter);
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
