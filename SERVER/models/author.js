const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },

    penName: {
        type: String,
        index: true
    },

    bio: {
        type: String,
        default: null
    },

    languages: [{
        type: Object,
        default: []
    }],

    categories: [{
        type: Object,
        default: []
    }],

    languages: [{
        type: String
    }],

    country: {
        type: String
    },

    totalAudiobooks: {
        type: Number,
        default: 0
    },

    totalCompletions: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },

    enabled: {
        type: Boolean,
        default: true,
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

module.exports = mongoose.model("etmw2026_authors", model);
