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
        const userId = req.userId || null;
        const conversationWithUserId = payload.conversationWithUserId || null;
        const messageId = payload.messageId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const now = Date.now();
        const query = {
            targetType: 'message',
            targetId: userId,
            isRead: false
        };

        if (messageId) {
            query._id = messageId;
        } else if (conversationWithUserId) {
            query.userId = conversationWithUserId;
        }

        const result = await Comment.updateMany(query, {
            $set: {
                isRead: true,
                readAt: now,
                updatedAt: now
            }
        });

        return res.status(200).json({
            success: true,
            updated: Number(result?.modifiedCount || 0)
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
