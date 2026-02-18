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
    totalChapters: {
        type: Number,
        index: false,
        required: true
    },
    language: {
        type: String,
        index: false,
        required: true
    },
    chapterPieces: {
        type: Object,
        index: false,
        required: true,
        default: [{
            title: null,
            quote: null,
            readingText: null,
            audioImage: null,
            audioUrl: null,
            slideIndex: 0,
            isPlaying: false,
            isMuted: false,
            progress: 0,
            expanded: false,
            hasResume: false,
            resumeTime: 0
        }]
    },
    image: {
        type: String,
        index: false,
        required: false
    },
    author: {
        type: String,
        index: false,
        required: true
    },
    title: {
        type: String,
        index: false,
        required: true
    },
    subtitle: {
        type: String,
        index: false,
        required: true
    },
    quote: {
        type: String,
        index: false,
        required: true
    },
    slideIndex: {
        type: Number,
        index: false,
        required: true
    },

    enabled: { 
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Number,    // when was created
        default: Date.now
    },
    updatedAt: { 
        type: Number,    // when was last updated
        default: Date.now
    },

});

module.exports = mongoose.model("etmw2026_story", model);
