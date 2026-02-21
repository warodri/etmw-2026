const Author = require('../models/etmw2026_authors');

module.exports = {

    async createAuthor({ userId, penName, bio, languages, country }) {
        return Author.create({
            userId,
            penName,
            bio,
            languages,
            country
        });
    },

    async getAuthorByUserId(userId) {
        return Author.findOne({ userId, enabled: true });
    },

    async getAuthorById(authorId) {
        return Author.findOne({ _id: authorId, enabled: true });
    },

    async incrementAudiobooks(authorId) {
        return Author.updateOne(
            { _id: authorId },
            { $inc: { totalAudiobooks: 1 } }
        );
    },

};
