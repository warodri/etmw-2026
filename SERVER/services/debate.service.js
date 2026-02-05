const Debate = require('../models/etmw2026_debates');

module.exports = {

    async createDebate(audiobookId, authorId) {
        return Debate.create({ audiobookId, authorId });
    },

    async getDebateByAudiobook(audiobookId) {
        return Debate.findOne({ audiobookId, enabled: true });
    },

    async incrementMessageCount(debateId) {
        return Debate.updateOne(
            { _id: debateId },
            { $inc: { totalMessages: 1 } }
        );
    }

};
