const Comment = require('../models/comment');

async function run(data, req, res) {
    try {
        const {
            id,
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

        const updateData = { updatedAt: Date.now() };
        if (text !== undefined) updateData.text = text;
        if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
        if (attachments !== undefined) updateData.attachments = attachments;

        const comment = await Comment.findByIdAndUpdate(id, updateData, { new: true });

        if (!comment) {
            return res.status(200).json({
                success: false,
                message: 'Comment not found'
            })
        }

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