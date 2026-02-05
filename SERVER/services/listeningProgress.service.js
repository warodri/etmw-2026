const Progress = require('../models/etmw2026_listening_progress');

module.exports = {

    async upsertProgress({ userId, audiobookId, progressPercent }) {
        const completed = progressPercent >= 80;

        return Progress.updateOne(
            { userId, audiobookId },
            {
                progressPercent,
                completed,
                updatedAt: Date.now()
            },
            { upsert: true }
        );
    },

    async hasCompletedBook(userId, audiobookId) {
        return Progress.exists({
            userId,
            audiobookId,
            completed: true
        });
    },

    async countCompletedBooksForPeriod({ userId, from, to }) {
        return Progress.countDocuments({
            userId,
            completed: true,
            updatedAt: { $gte: from, $lte: to }
        });
    }

};
