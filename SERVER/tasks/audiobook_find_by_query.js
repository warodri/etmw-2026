const { cleanList, escapeRegex, applyCommonFilters, runFindWithQuery, unexpectedError } = require('./audiobook_find_shared');

async function run(data, req, res) {
    try {
        const queryText = String(data?.query || '').trim();
        if (!queryText) {
            return res.status(200).json({
                success: true,
                audiobooks: [],
                hasMore: false
            });
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

        const q = new RegExp(escapeRegex(queryText), 'i');
        mongoQuery.$or = [
            { title: q },
            { authorName: q },
            { description: q },
            { voiceName: q },
            { categories: { $elemMatch: { $regex: q } } }
        ];

        const result = await runFindWithQuery(mongoQuery, data);
        return res.status(200).json(result);
    } catch (ex) {
        return unexpectedError(res, ex, __filename);
    }
}

module.exports = {
    run
};
