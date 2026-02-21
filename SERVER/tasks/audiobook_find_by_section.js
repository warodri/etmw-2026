const { Audiobook, cleanList, sanitizeAudiobook, applyCommonFilters, runFindWithQuery, unexpectedError } = require('./audiobook_find_shared');
const mongoose = require('mongoose');

const Reaction = require('../models/reaction');
const Comment = require('../models/comment');
const AudiobookChapterLog = require('../models/audiobook_chapter_log');

async function run(data, req, res) {
    try {
        const section = String(data?.section || '').trim().toLowerCase();

        if (section === 'trending') {
            const result = await findTrending(data, req);
            return res.status(200).json(result);
        }

        if (section === 'for-you') {
            const result = await findForYou(data, req);
            return res.status(200).json(result);
        }

        const mongoQuery = { enabled: true };

        const authorIdsList = cleanList(data?.authorIds);
        if (authorIdsList.length > 0) {
            mongoQuery.authorId = { $in: authorIdsList };
        }

        const categoriesList = cleanList(data?.categories);
        if (categoriesList.length > 0) {
            mongoQuery.categories = { $in: categoriesList };
        }

        const common = await applyCommonFilters(mongoQuery, data, req);
        if (!common.ok) {
            return res.status(200).json({
                success: false,
                message: common.reason || 'invalid data'
            });
        }
        if (common.forceEmpty) {
            return res.status(200).json({
                success: true,
                audiobooks: [],
                hasMore: false
            });
        }

        const result = await runFindWithQuery(mongoQuery, data);
        return res.status(200).json(result);
    } catch (ex) {
        return unexpectedError(res, ex, __filename);
    }
}

function parseIntSafe(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toObjectId(value) {
    if (!value) return null;
    const asString = String(value);
    if (!mongoose.Types.ObjectId.isValid(asString)) return null;
    return new mongoose.Types.ObjectId(asString);
}

async function findTrending(data, req) {
    const limit = parseIntSafe(data?.limit, 10);
    const skip = parseIntSafe(data?.skip, 0);

    const [reactionAgg, commentAgg, accessAgg] = await Promise.all([
        Reaction.aggregate([
            { $match: { targetType: 'audiobook' } },
            { $group: { _id: '$targetId', count: { $sum: 1 } } }
        ]),
        Comment.aggregate([
            { $match: { targetType: 'audiobook' } },
            { $group: { _id: '$targetId', count: { $sum: 1 } } }
        ]),
        AudiobookChapterLog.aggregate([
            { $match: { enabled: true } },
            { $group: { _id: '$audiobookId', count: { $sum: 1 } } }
        ])
    ]);

    const hasEngagementData =
        reactionAgg.length > 0 || commentAgg.length > 0 || accessAgg.length > 0;

    if (!hasEngagementData) {
        const fallbackQuery = { enabled: true };
        const common = await applyCommonFilters(fallbackQuery, data, req);
        if (!common.ok) return { success: false, message: common.reason || 'invalid data' };
        if (common.forceEmpty) return { success: true, audiobooks: [], hasMore: false };

        const categoriesList = cleanList(data?.categories);
        if (categoriesList.length > 0) {
            fallbackQuery.categories = { $in: categoriesList };
        }

        const authorIdsList = cleanList(data?.authorIds);
        if (authorIdsList.length > 0) {
            fallbackQuery.authorId = { $in: authorIdsList };
        }

        return runFindWithQuery(
            { ...fallbackQuery },
            { ...data, limit: 10, skip }
        );
    }

    const scoreByAudiobookId = new Map();

    const addScore = (key, delta) => {
        if (!key) return;
        const id = String(key);
        scoreByAudiobookId.set(id, (scoreByAudiobookId.get(id) || 0) + delta);
    };

    reactionAgg.forEach((item) => addScore(item._id, Number(item.count || 0) * 3));
    commentAgg.forEach((item) => addScore(item._id, Number(item.count || 0) * 2));
    accessAgg.forEach((item) => addScore(item._id, Number(item.count || 0) * 1));

    const sortedIds = Array.from(scoreByAudiobookId.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

    if (sortedIds.length === 0) {
        return {
            success: true,
            audiobooks: [],
            hasMore: false
        };
    }

    const validObjectIds = sortedIds
        .map((id) => toObjectId(id))
        .filter(Boolean);

    if (validObjectIds.length === 0) {
        return {
            success: true,
            audiobooks: [],
            hasMore: false
        };
    }

    const mongoQuery = {
        enabled: true,
        _id: { $in: validObjectIds }
    };

    const categoriesList = cleanList(data?.categories);
    if (categoriesList.length > 0) {
        mongoQuery.categories = { $in: categoriesList };
    }

    const authorIdsList = cleanList(data?.authorIds);
    if (authorIdsList.length > 0) {
        mongoQuery.authorId = { $in: authorIdsList };
    }

    const common = await applyCommonFilters(mongoQuery, data, req);
    if (!common.ok) return { success: false, message: common.reason || 'invalid data' };
    if (common.forceEmpty) return { success: true, audiobooks: [], hasMore: false };

    const rows = await Audiobook.find(mongoQuery);
    const byId = new Map(rows.map((row) => [String(row._id), row]));
    const ordered = sortedIds
        .map((id) => byId.get(String(id)))
        .filter(Boolean);

    const paged = ordered.slice(skip, skip + limit);
    const audiobooks = paged.map((book) => sanitizeAudiobook(book));

    return {
        success: true,
        audiobooks,
        hasMore: (skip + paged.length) < ordered.length
    };
}

async function findForYou(data, req) {
    const userId = req.userId || null;
    if (!userId) {
        return findTrending(data, req);
    }

    const userLogs = await AudiobookChapterLog.aggregate([
        { $match: { userId: String(userId), enabled: true } },
        { $group: { _id: '$audiobookId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 }
    ]);

    if (userLogs.length === 0) {
        return findTrending(data, req);
    }

    const sourceIds = userLogs.map((item) => String(item._id));
    const seedBooks = await Audiobook.find({
        _id: { $in: sourceIds },
        enabled: true
    });

    const preferredAuthors = new Set(seedBooks.map((item) => String(item.authorId)));
    const preferredCategories = new Set(
        seedBooks.flatMap((item) => Array.isArray(item.categories) ? item.categories : [])
    );

    if (preferredAuthors.size === 0 && preferredCategories.size === 0) {
        return findTrending(data, req);
    }

    const mongoQuery = { enabled: true };
    const orFilters = [];

    if (preferredAuthors.size > 0) {
        orFilters.push({ authorId: { $in: Array.from(preferredAuthors) } });
    }
    if (preferredCategories.size > 0) {
        orFilters.push({ categories: { $in: Array.from(preferredCategories) } });
    }
    if (orFilters.length > 0) {
        mongoQuery.$or = orFilters;
    }

    const categoriesList = cleanList(data?.categories);
    if (categoriesList.length > 0) {
        mongoQuery.categories = { $in: categoriesList };
    }

    const authorIdsList = cleanList(data?.authorIds);
    if (authorIdsList.length > 0) {
        mongoQuery.authorId = { $in: authorIdsList };
    }

    const common = await applyCommonFilters(mongoQuery, data, req);
    if (!common.ok) return { success: false, message: common.reason || 'invalid data' };
    if (common.forceEmpty) return { success: true, audiobooks: [], hasMore: false };

    return runFindWithQuery(mongoQuery, data);
}


module.exports = {
    run
};
