const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },
    lastUnreadCount: {
        type: Number,
        default: 0
    },
    lastProcessingTime: {
        type: Number,
    },
    totalProcessingPerDay: {
        type: Number,
        default: 0
    },
    lastProcessingDay: {
        type: Number,
        default: null,
        index: true
    },
    lastSummary: {
        type: String,
        default: ''
    },


    enabled: {
        type: Boolean,
        default: true,
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

model.index({ userId: 1 }, { unique: true });
model.index({ userId: 1, lastProcessingDay: 1 });

module.exports = mongoose.model("etmw2026_comments_ai_summary", model);
