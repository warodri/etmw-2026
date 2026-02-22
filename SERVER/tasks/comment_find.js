const Comment = require('../models/comment');

function parsePayload(req, data) {
    let payload = (req.body && req.body.data) ? req.body.data : (data || {});
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch {
            payload = {};
        }
    }
    return payload || {};
}

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const {
            targetId,
            targetType,
            parentCommentId,
            conversationWithUserId
        } = payload;

        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const limit = Math.min(100, Math.max(1, parseInt(payload.limit, 10) || 50));
        const skip = Math.max(0, parseInt(payload.skip, 10) || 0);
        const sortDir = String(payload.sortDir || 'asc').toLowerCase() === 'desc' ? -1 : 1;

        let query = {};

        if (targetType === 'message') {
            query = {
                targetType: 'message',
                $or: conversationWithUserId
                    ? [
                        { userId, targetId: conversationWithUserId },
                        { userId: conversationWithUserId, targetId: userId }
                    ]
                    : [
                        { userId },
                        { targetId: userId }
                    ]
            };
        } else {
            if (targetId) query.targetId = targetId;
            if (targetType) query.targetType = targetType;
            if (parentCommentId !== undefined) {
                query.parentCommentId = parentCommentId || null;
            }
        }

        const [comments, total] = await Promise.all([
            Comment.find(query)
                .populate('userId', '_id firstName lastName profilePicture email')
                .sort({ createdAt: sortDir })
                .limit(limit)
                .skip(skip),
            Comment.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            comments,
            total
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

module.exports = {
    run
};
