const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        index: true,
        required: true
    },
    firstCommentId: {
        type: String,
        required: true
    },
    lastCommentId: {
        type: String,
        required: true
    },
    podcastAudioUrl: {
        type: String,
        required: true
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

module.exports = mongoose.model("etmw2026_podcast", model);
