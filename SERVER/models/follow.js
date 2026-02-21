const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: String,
        index: true,
        required: true
    },

    followingUserId: {
        type: String,
        index: true,
        required: true
    },

    enabled: {
        type: Boolean,
        default: true,
        index: true
    },
    createdAt: {
        type: Number,
        default: Date.now,
    },
    updatedAt: {
        type: Number,
        default: Date.now,
    }

});

model.index({ targetId: 1, targetType: 1, createdAt: 1 });

module.exports = mongoose.model("etmw2026_follow", model);
