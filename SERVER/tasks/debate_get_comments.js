async function run(data, req, res) {
    try {
        let {
            audiobookId,
            skip,
            limit
        } = data;

        const userId = req.userId || null;

        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        if (!skip) skip = 0;
        if (!limit) limit = 20;
        skip = parseInt(skip, 10) || 0;
        limit = parseInt(limit, 10) || 20;

        const DebateComments = require('../models/debate_comment');
        const mongoQuery = {
            audiobookId,
            enabled: true
        };
        const comments = await DebateComments.find(mongoQuery)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId');

        const commentIds = comments.map((item) => item._id);
        let likeCountsMap = new Map();
        let myLikedMap = new Map();

        if (commentIds.length > 0) {
            const Reaction = require('../models/reaction');
            const likeCounts = await Reaction.aggregate([
                {
                    $match: {
                        enabled: true,
                        targetType: 'debate-comment',
                        reaction: 'like',
                        targetId: { $in: commentIds }
                    }
                },
                {
                    $group: {
                        _id: '$targetId',
                        total: { $sum: 1 }
                    }
                }
            ]);
            likeCountsMap = new Map(
                likeCounts.map((item) => [String(item._id), Number(item.total || 0)])
            );

            if (userId) {
                const myLikes = await Reaction.find({
                    userId,
                    enabled: true,
                    targetType: 'debate-comment',
                    reaction: 'like',
                    targetId: { $in: commentIds }
                }).select('targetId');

                myLikedMap = new Map(
                    myLikes.map((item) => [String(item.targetId), true])
                );
            }
        }

        const total = await DebateComments.countDocuments(mongoQuery);
        const hasMore = (skip + comments.length) < total;

        const commentsWithReactions = comments.map((item) => {
            const obj = item.toObject ? item.toObject() : item;
            const id = String(obj._id);
            return {
                ...obj,
                likeCount: likeCountsMap.get(id) || 0,
                isLiked: !!myLikedMap.get(id)
            };
        });

        return res.status(200).json({
            success: true,
            comments: commentsWithReactions,
            hasMore
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
