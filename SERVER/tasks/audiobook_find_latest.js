const {
    cleanList,
    applyCommonFilters,
    runFindWithQuery,
    unexpectedError
} = require('./audiobook_find_shared');

async function run(data, req, res) {
    try {
        const mongoQuery = {
            enabled: true
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

        const limit = data?.limit ?? 10;
        const skip = data?.skip ?? 0;
        const result = await runFindWithQuery(mongoQuery, {
            ...data,
            latest: true,
            limit,
            skip
        });

        return res.status(200).json(result);
    } catch (ex) {
        return unexpectedError(res, ex, __filename);
    }
}

module.exports = {
    run
};
