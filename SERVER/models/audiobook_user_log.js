const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    audiobookId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
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
        default: Date.now,
        index: true
    }

});

model.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model("etmw2026_audiobook_user_log", model);
