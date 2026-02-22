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
            id,
            text,
            audioUrl,
            attachments
        } = payload;

        const userId = req.userId || null;
        if (!userId || !id) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const updateData = { updatedAt: Date.now() };
        if (text !== undefined) updateData.text = String(text || '').trim();
        if (audioUrl !== undefined) updateData.audioUrl = audioUrl || undefined;
        if (attachments !== undefined) updateData.attachments = Array.isArray(attachments) ? attachments : [];

        const comment = await Comment.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true }
        ).populate('userId', '_id firstName lastName profilePicture email');

        if (!comment) {
            return res.status(200).json({
                success: false,
                message: 'Comment not found'
            });
        }

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
