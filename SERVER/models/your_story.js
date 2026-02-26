const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    name: String,
    age: String,
    role: String,
    personality: String,
    internalConflict: String,
    externalGoal: String
}, { _id: false });

const BlueprintSchema = new mongoose.Schema({
    storyTitle: String,
    genre: String,
    tone: String,
    inspirationalStyleNotes: String,
    storyFoundation: String,
    mainConflict: String,
    longTermArc: String,
    worldRules: String,
    characters: [CharacterSchema],
    chapterGenerationInstructions: String
}, { _id: false });

const StorySchema = new mongoose.Schema({
    
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'etmw2026_users' 
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'etmw2026_authors' 
    },
    isAIGenerated: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['draft', 'publishing', 'published', 'archived'],
        default: 'draft'
    },
    blueprint: BlueprintSchema,
    totalChaptersGenerated: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('etmw2026_your_story', StorySchema);
