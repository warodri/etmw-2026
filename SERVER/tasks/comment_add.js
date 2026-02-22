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
            text,
            audioUrl,
            attachments
        } = payload;

        const userId = req.userId || null;
        const normalizedText = String(text || '').trim();

        if (!userId || !targetId || !targetType || (!normalizedText && !audioUrl)) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const allowedTypes = ['audiobook', 'debate', 'author', 'comment', 'message'];
        if (!allowedTypes.includes(String(targetType))) {
            return res.status(200).json({
                success: false,
                message: 'Invalid target type'
            });
        }

        if (targetType === 'message') {
            const User = require('../models/user');
            const recipient = await User.findOne({
                _id: targetId,
                enabled: true
            }).select('_id');
            if (!recipient) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid recipient'
                });
            }
        }

        const now = Date.now();
        const isMessage = targetType === 'message';
        const comment = new Comment({
            userId,
            targetId,
            targetType,
            parentCommentId: parentCommentId || null,
            text: normalizedText || undefined,
            audioUrl: audioUrl || undefined,
            attachments: Array.isArray(attachments) ? attachments : [],
            isRead: isMessage ? false : true,
            readAt: isMessage ? null : now,
            createdAt: now,
            updatedAt: now
        });

        await comment.save();
        await comment.populate('userId', '_id firstName lastName profilePicture email');

        return res.status(200).json({
            success: true,
            comment
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
