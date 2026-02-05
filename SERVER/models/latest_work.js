const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        unique: true
    },

    addedAt: {
        type: Number,
        default: Date.now,
        index: true
    }

});

module.exports = mongoose.model("etmw2026_latest_works", model);
