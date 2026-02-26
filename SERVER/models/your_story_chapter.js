const ChapterSchema = new mongoose.Schema({

    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'etmw2026_your_story',
        required: true
    },
    chapterNumber: Number,
    title: String,
    summary: String,
    content: String,
    characterProgression: String,
    hooksForNextChapter: String,
    wordCount: Number,
    aiModelUsed: String,

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

export default mongoose.model('etmw2026_your_story_chapter', ChapterSchema);   