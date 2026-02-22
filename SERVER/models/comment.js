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
        enum: ['audiobook', 'debate', 'author', 'comment', 'message'],
        index: true
    },

    parentCommentId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_comments",
        default: null,
        index: true
    },

    text: {
        type: String
    },

    audioUrl: {
        type: String
    },

    attachments: [{
        type: {
            type: String,
            enum: ['image', 'video', 'pdf', 'txt']
        },
        url: String
    }],

    isRead: {
        type: Boolean,
        default: true,
        index: true
    },

    readAt: {
        type: Number,
        default: null,
        index: true
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

model.index({ targetId: 1, targetType: 1, createdAt: 1 });
model.index({ targetType: 1, targetId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("etmw2026_comments", model);
