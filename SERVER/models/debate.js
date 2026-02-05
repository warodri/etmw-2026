const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        index: true,
        required: true
    },

    authorId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_authors"
    },

    totalMessages: {
        type: Number,
        default: 0
    },

    enabled: {
        type: Boolean,
        default: true,
        index: true,
    },

    createdAt: {
        type: Number,
        default: Date.now,
        index: true,
    },

    updatedAt: {
        type: Number,
        default: Date.now,
        index: true
    }

});

module.exports = mongoose.model("etmw2026_debates", model);
