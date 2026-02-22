const DebateComment = require('../models/debate_comment');
const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            limit = 5
        } = data || {};

        const userId = req.userId || null;
        if (!audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 5, 20));

        // Recent threads = latest top-level comments for this audiobook.
        const threadsBase = await DebateComment.find({
            audiobookId,
            enabled: true,
            $or: [
                { parentMessageId: null },
                { parentMessageId: '' },
                { parentMessageId: { $exists: false } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(parsedLimit)
            .populate('userId');

        if (!threadsBase.length) {
            return res.status(200).json({
                success: true,
                threads: []
            });
        }

        const threadIds = threadsBase.map((item) => item._id);
        const threadIdStrings = threadsBase.map((item) => String(item._id));

        const [likeAgg, replyAgg, myLikes] = await Promise.all([
            Reaction.aggregate([
                {
                    $match: {
                        enabled: true,
                        targetType: 'debate-comment',
                        reaction: 'like',
                        targetId: { $in: threadIds }
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
                        parentMessageId: { $in: threadIdStrings }
                    }
                },
                {
                    $group: {
                        _id: '$parentMessageId',
                        total: { $sum: 1 }
                    }
                }
            ]),
            userId ? Reaction.find({
                userId,
                enabled: true,
                targetType: 'debate-comment',
                reaction: 'like',
                targetId: { $in: threadIds }
            }).select('targetId') : []
        ]);

        const likesById = new Map(
            likeAgg.map((item) => [String(item._id), Number(item.total || 0)])
        );
        const repliesById = new Map(
            replyAgg.map((item) => [String(item._id), Number(item.total || 0)])
        );
        const myLikesSet = new Set(
            (myLikes || []).map((item) => String(item.targetId))
        );

        const threads = threadsBase.map((comment) => {
            const obj = comment.toObject ? comment.toObject() : comment;
            const id = String(obj._id);
            return {
                ...obj,
                likeCount: likesById.get(id) || 0,
                replyCount: repliesById.get(id) || 0,
                isLiked: myLikesSet.has(id)
            };
        });

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

