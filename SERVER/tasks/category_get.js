const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;

        const categories = await Category.find({
            enabled: true
        }).populate('parentId');

        const Audiobook = require('../models/audiobook');
        const categoryCounts = await Audiobook.aggregate([
            { $match: { enabled: true } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);
        const countsByName = new Map(
            categoryCounts.map((item) => [String(item._id), item.count])
        );

        const authorCounts = await Audiobook.aggregate([
            { $match: { enabled: true } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', authors: { $addToSet: '$authorId' } } },
            { $project: { authorCount: { $size: '$authors' } } }
        ]);

        const authorCountsByName = new Map(
            authorCounts.map((item) => [String(item._id), item.authorCount])
        );

        const authorIdsByCategory = await Audiobook.aggregate([
            { $match: { enabled: true } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', authors: { $addToSet: '$authorId' } } }
        ]);

        const authorIdsMap = new Map(
            authorIdsByCategory.map((item) => [String(item._id), item.authors || []])
        );

        const allAuthorIds = Array.from(
            new Set(authorIdsByCategory.flatMap((item) => (item.authors || []).map((id) => String(id))))
        );

        let authorsById = new Map();
        if (allAuthorIds.length > 0) {
            const Author = require('../models/author');
            const authorDocs = await Author.find({
                _id: { $in: allAuthorIds },
                enabled: true
            }).populate('userId');

            authorsById = new Map(
                authorDocs.map((doc) => [String(doc._id), doc])
            );
        }

        const categoriesWithCounts = categories.map((cat) => {
            const obj = cat.toObject ? cat.toObject() : cat;
            const authorIds = authorIdsMap.get(String(obj.name)) || [];
            const authors = authorIds
                .map((authorId) => authorsById.get(String(authorId)))
                .filter((authorDoc) => authorDoc && authorDoc.userId)
                .map((authorDoc) => {
                    const user = authorDoc.userId;
                    return {
                        _id: String(authorDoc._id),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePicture: user.profilePicture,
                        city: user.city,
                        country: user.country,
                        bio: user.bio,
                        languages: user.languages,
                        connected: user.connected,
                        forceStatus: user.forceStatus,
                        totalFollowers: user.totalFollowers,
                        totalFollowing: user.totlaFollowing
                    };
                });
            return {
                ...obj,
                count: countsByName.get(String(obj.name)) || 0,
                authorCount: authorCountsByName.get(String(obj.name)) || 0,
                authors
            };
        });

        return res.status(200).json({
            success: true,
            categories: categoriesWithCounts
        })

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

module.exports = {
    run
}
