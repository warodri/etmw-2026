const Comment = require('../models/etmw2026_comments');

module.exports = {

    async addComment(payload) {
        return Comment.create(payload);
    },

    async getCommentsForTarget({ targetId, targetType, limit = 20, skip = 0 }) {
        return Comment.find({ targetId, targetType })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);
    },

    async getReplies(parentCommentId) {
        return Comment.find({ parentCommentId })
            .sort({ createdAt: 1 });
    }

};
