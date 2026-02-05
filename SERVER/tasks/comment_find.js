const Comment = require('../models/comment');

async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType,
            parentCommentId,
            limit = 50,
            skip = 0
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = {};
        if (targetId) query.targetId = targetId;
        if (targetType) query.targetType = targetType;
        if (parentCommentId !== undefined) query.parentCommentId = parentCommentId;

        const comments = await Comment.find(query)
            .populate('userId')
            .populate('parentCommentId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Comment.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: comments,
            total
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