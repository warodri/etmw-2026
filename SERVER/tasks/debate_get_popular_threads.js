const DebateComment = require('../models/debate_comment');
const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            limit = 5
        } = data || {};

        const userId = req.userId || null;
        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 5, 20));

        // Popular "threads" are top-level comments in this audiobook.
        const parentComments = await DebateComment.find({
            audiobookId,
            enabled: true,
            $or: [
                { parentMessageId: null },
                { parentMessageId: '' },
                { parentMessageId: { $exists: false } }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('userId');

        if (!parentComments.length) {
            return res.status(200).json({
                success: true,
                threads: []
            });
        }

        const parentIds = parentComments.map((item) => item._id);
        const parentIdStrings = parentComments.map((item) => String(item._id));

        const [likeAgg, replyAgg, myLikes] = await Promise.all([
            Reaction.aggregate([
                {
                    $match: {
                        enabled: true,
                        targetType: 'debate-comment',
                        reaction: 'like',
                        targetId: { $in: parentIds }
                    }
                },
                {
                    $group: {
                        _id: '$targetId',
                        total: { $sum: 1 }
                    }
                }
            ]),
            DebateComment.aggregate([
                {
                    $match: {
                        audiobookId,
                        enabled: true,
                        parentMessageId: { $in: parentIdStrings }
                    }
                },
                {
                    $group: {
                        _id: '$parentMessageId',
                        total: { $sum: 1 }
                    }
                }
            ]),
            Reaction.find({
                userId,
                enabled: true,
                targetType: 'debate-comment',
                reaction: 'like',
                targetId: { $in: parentIds }
            }).select('targetId')
        ]);

        const likesById = new Map(
            likeAgg.map((item) => [String(item._id), Number(item.total || 0)])
        );
        const repliesById = new Map(
            replyAgg.map((item) => [String(item._id), Number(item.total || 0)])
        );
        const myLikesSet = new Set(
            myLikes.map((item) => String(item.targetId))
        );

        const threads = parentComments
            .map((comment) => {
                const obj = comment.toObject ? comment.toObject() : comment;
                const id = String(obj._id);
                const likeCount = likesById.get(id) || 0;
                const replyCount = repliesById.get(id) || 0;
                const score = (likeCount * 3) + (replyCount * 2);
                return {
                    ...obj,
                    likeCount,
                    replyCount,
                    isLiked: myLikesSet.has(id),
                    score
                };
            })
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return Number(b.createdAt || 0) - Number(a.createdAt || 0);
            })
            .slice(0, parsedLimit)
            .map(({ score, ...item }) => item);

        return res.status(200).json({
            success: true,
            threads
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        return res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

module.exports = {
    run
};
