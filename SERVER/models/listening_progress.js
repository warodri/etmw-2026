const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: String,
        index: true
    },
    audiobookId: {
        type: String,
        index: true
    },
    chapterNumber: {
        type: Number
    },
    progressPercent: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },

    enabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    updatedAt: {
        type: Number,
        default: Date.now
    }

});

model.index({ userId: 1, audiobookId: 1 }, { unique: true });

module.exports = mongoose.model("etmw2026_listening_progress", model);
