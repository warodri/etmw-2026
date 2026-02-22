const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    debateId: {
        type: String,
        index: true,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        required: true
    },
    text: {
        type: String,
    },
    audioUrl: {
        type: String,
    },
    hasAttachments: {
        type: Boolean,
    },
    attachments: {
        type: Object,
        default: []
    },
    parentMessageId: {
        type: String
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

module.exports = mongoose.model("etmw2026_debate_comment", model);
