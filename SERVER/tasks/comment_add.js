const Comment = require('../models/comment');

async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType,
            parentCommentId,
            text,
            audioUrl,
            attachments
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const now = Date.now();
        const comment = new Comment({
            userId,
            targetId,
            targetType,
            parentCommentId,
            text,
            audioUrl,
            attachments,
            createdAt: now,
            updatedAt: now
        });

        await comment.save();

        return res.status(200).json({
            success: true,
            data: comment
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