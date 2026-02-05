const Audiobook = require('../models/etmw2026_audiobooks');

module.exports = {

    async createAudiobook(payload) {
        return Audiobook.create(payload);
    },

    async updatePipelineStatus(audiobookId, status) {
        return Audiobook.updateOne(
            { _id: audiobookId },
            { pipelineStatus: status, updatedAt: Date.now() }
        );
    },

    async publishAudiobook(audiobookId) {
        return Audiobook.updateOne(
            { _id: audiobookId },
            {
                published: true,
                pipelineStatus: 'published',
                publishedAt: Date.now()
            }
        );
    },

    async getPublishedAudiobook(audiobookId) {
        return Audiobook.findOne({
            _id: audiobookId,
            published: true
        });
    },

    async listPublished({ limit = 20, skip = 0 }) {
        return Audiobook.find({ published: true })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);
    }

};
