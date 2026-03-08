const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({
    audiobookId: {
        type: String,
        index: true,
        required: true
    },
    chapterNumber: {
        type: Number,
        index: true,
        required: true
    },
    sourceLanguage: {
        type: String,
        index: true
    },
    targetLanguage: {
        type: String,
        index: true
    },
    ttsLanguage: {
        type: String,
        index: false
    },
    narrationStyle: {
        type: String,
        default: 'Essay'
    },
    totalChapters: {
        type: Number
    },
    totalPages: {
        type: Number
    },
    inputText: {
        type: String,
        default: ''
    },
    finalText: {
        type: String,
        default: ''
    },
    translated: {
        type: Boolean,
        default: false
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

model.index({ audiobookId: 1, chapterNumber: 1, targetLanguage: 1, enabled: 1 });

module.exports = mongoose.model("etmw2026_audiobook_chapter_source", model);
