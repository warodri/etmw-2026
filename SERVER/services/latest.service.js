const LatestAuthors = require('../models/etmw2026_latest_authors');
const LatestWorks = require('../models/etmw2026_latest_works');

module.exports = {

    async addLatestAuthor(authorId) {
        await LatestAuthors.findOneAndDelete(
            {},
            { sort: { addedAt: 1 } }
        );

        return LatestAuthors.create({ authorId });
    },

    async addLatestWork(audiobookId) {
        await LatestWorks.findOneAndDelete(
            {},
            { sort: { addedAt: 1 } }
        );

        return LatestWorks.create({ audiobookId });
    },

    async getLatestAuthors() {
        return LatestAuthors.find()
            .sort({ addedAt: -1 })
            .limit(5)
            .populate('authorId');
    },

    async getLatestWorks() {
        return LatestWorks.find()
            .sort({ addedAt: -1 })
            .limit(5)
            .populate('audiobookId');
    }

};
