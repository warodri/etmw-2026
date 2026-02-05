const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },

    targetId: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true
    },

    targetType: {
        type: String,
        enum: ['author', 'audiobook', 'comment'],
        index: true
    },

    reaction: {
        type: String,
        enum: ['like', 'love', 'insightful', 'angry', 'sad', 'wow'],
        index: true
    },

    createdAt: {
        type: Number,
        default: Date.now
    }

});

model.index(
    { userId: 1, targetId: 1, targetType: 1, reaction: 1 },
    { unique: true }
);

module.exports = mongoose.model("etmw2026_reactions", model);
