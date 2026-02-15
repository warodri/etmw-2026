const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: String,
        index: true,
        required: true
    },
    audiobookId: {
        type: String,
        index: true,
        required: true
    },
    chapterNumber: {
        type: Number,
        index: true,
        required: true
    },

    enabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Number,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Number,
        default: Date.now
    }

});

module.exports = mongoose.model("etmw2026_user_chapter_available", model);