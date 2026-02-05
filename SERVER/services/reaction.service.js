const Reaction = require('../models/etmw2026_reactions');

module.exports = {

    async addReaction({ userId, targetId, targetType, reaction }) {
        return Reaction.create({
            userId,
            targetId,
            targetType,
            reaction
        });
    },

    async removeReaction({ userId, targetId, targetType, reaction }) {
        return Reaction.deleteOne({
            userId,
            targetId,
            targetType,
            reaction
        });
    },

    async countReactions(targetId, targetType) {
        return Reaction.aggregate([
            { $match: { targetId, targetType } },
            { $group: { _id: "$reaction", count: { $sum: 1 } } }
        ]);
    }

};
