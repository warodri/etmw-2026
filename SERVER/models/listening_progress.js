const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true
    },

    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        index: true
    },

    progressPercent: {
        type: Number,
        default: 0
    },

    completed: {
        type: Boolean,
        default: false,
        index: true
    },

    updatedAt: {
        type: Number,
        default: Date.now
    }

});

model.index({ userId: 1, audiobookId: 1 }, { unique: true });

module.exports = mongoose.model("etmw2026_listening_progress", model);
