const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    file: {
        type: Object
    },
    coverFile: {
        type: String,
    },
    coverFileMimetype: {
        type: String,
    },
    uploadMethod: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
    },
    totalPrice: {
        type: Number,
    },
    basePrice: {
        type: Number,
    },
    hasReferral: {
        type: Boolean,
    },

    authorId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_authors",
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
    voiceId: {
        type: String,
        required: true
    },
    voiceName: {
        type: String,
        required: true
    },
    voiceGender: {
        type: String,
    },
    voiceUrl: {
        type: String,
    },
    useExpression: {
        type: Boolean,
        default: false
    },
    speechRate: {
        type: String,
    },
    stability: {
        type: Number,
    },
    clarity: {
        type: Number,
    },
    title: {
        type: String,
        index: true
    },
    authorName: {
        type: String,
    },
    description: {
        type: String
    },
    categories: {
        type: Object,
        default: []
    },

    /**
     * PAYMENT INFO
     */
    paymentCompleted: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String,
    },
    paymentAmount: {
        type: Number,
    },
    paymentDate: {
        type: Number,
    },
    stripeSessionId: {
        type: String,
    },

    /**
     * ONCE THE BOOK IS PUBLISHED
     */
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
    totalChapters: {
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

model.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model("etmw2026_audiobooks", model);
