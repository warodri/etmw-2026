const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },
    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        index: true,
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

module.exports = mongoose.model("etmw2026_debates", model);
