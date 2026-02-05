const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    authorId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_authors",
        index: true,
        required: true
    },

    title: {
        type: String,
        index: true
    },

    description: {
        type: String
    },

    language: {
        type: String,
        index: true
    },

    accent: {
        type: String
    },

    categories: [{
        type: Schema.Types.ObjectId,
        ref: "etmw2026_categories"
    }],

    sourceType: {
        type: String,
        enum: ['pdf', 'physical_scan', 'text'],
        required: true
    },

    // ---- OCR + AI PIPELINE ----
    pipelineStatus: {
        type: String,
        enum: [
            'uploaded',
            'scanning',
            'ocr_completed',
            'tts_processing',
            'ready',
            'published',
            'failed'
        ],
        default: 'uploaded',
        index: true
    },

    totalPages: {
        type: Number
    },

    totalAudioDurationSec: {
        type: Number
    },

    audioFiles: [{
        chapter: Number,
        url: String,
        durationSec: Number
    }],

    published: {
        type: Boolean,
        default: false,
        index: true
    },

    publishedAt: {
        type: Number,
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

model.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model("etmw2026_audiobooks", model);
