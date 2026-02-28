const mongoose = require('mongoose');

const ChapterMemorySchema = new mongoose.Schema({

    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'etmw2026_your_story',
        required: true
    },
    chapterNumber: Number,
    memory: String,

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

ChapterMemorySchema.index({ storyId: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('etmw2026_your_story_chapter_memory', ChapterMemorySchema);
