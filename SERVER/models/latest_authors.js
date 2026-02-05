const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    authorId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_authors",
        unique: true
    },

    audiobookId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_audiobooks",
        index: true
    },

    addedAt: {
        type: Number,
        default: Date.now,
        index: true
    }

});

module.exports = mongoose.model("etmw2026_latest_authors", model);
