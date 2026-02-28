async function run(data, req, res) {
    try {
        const payload = (data && typeof data === 'object' && !Array.isArray(data)) ? data : req.body || {};

        const recordId = payload.recordId || req.body.recordId || null;
        const authorId = payload.authorId || req.body.authorId || null;
        const status = payload.status || req.body.status || 'draft';
        const totalChaptersGenerated = Number(payload.totalChaptersGenerated || req.body.totalChaptersGenerated || 0);
        const voiceLanguage = String(payload.voiceLanguage || req.body.voiceLanguage || '').trim();
        const isAIGeneratedRaw = payload.isAIGenerated ?? req.body.isAIGenerated;
        const isAIGenerated = (isAIGeneratedRaw === true || String(isAIGeneratedRaw).toLowerCase() === 'true');

        const blueprintRaw = payload.blueprint || req.body.blueprint || {};
        let blueprint = blueprintRaw;
        if (typeof blueprintRaw === 'string') {
            try {
                blueprint = JSON.parse(blueprintRaw);
            } catch (ex) {
                blueprint = {};
            }
        }

        const userId = req.userId || null;
        const file = req.file || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }
        if (!authorId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid authorId'
            });
        }

        const YourStory = require('../models/your_story');
        const AudioBook = require('../models/audiobook');
        const Author = require('../models/author');

        const author = await Author.findOne({
            _id: authorId,
            userId,
            enabled: true,
        });
        if (!author) {
            return res.status(200).json({
                success: false,
                message: 'Invalid author'
            });
        }

        const existing = await YourStory.findOne({
            _id: recordId,
            userId,
            enabled: true,
        });

        if (existing) {
            // UPDATE STORY
            existing.authorId = authorId;
            existing.isAIGenerated = isAIGenerated;
            existing.status = status;
            existing.blueprint = blueprint;
            existing.totalChaptersGenerated = totalChaptersGenerated;
            if (file) existing.coverFile = file;
            if (voiceLanguage) existing.voiceLanguage = voiceLanguage;
            existing.updatedAt = Date.now();
            await existing.save();

            // Keep audiobook synced when available
            if (existing.audiobookId) {
                const ab = await AudioBook.findOne({ _id: existing.audiobookId, enabled: true });
                if (ab) {
                    if (file?.filename && file?.mimetype) {
                        ab.coverFile = file.filename;
                        ab.coverFileMimetype = file.mimetype;
                    }
                    if (voiceLanguage) {
                        ab.targetLanguage = voiceLanguage;
                        ab.voiceId = voiceLanguage;
                        ab.voiceName = voiceLanguage;
                    }
                    const title = String(blueprint?.storyTitle || '').trim();
                    const description = String(blueprint?.storyFoundation || '').trim();
                    const genre = String(blueprint?.genre || '').trim();
                    if (title) ab.title = title;
                    if (description) ab.description = description;
                    if (genre) ab.categories = [genre];
                    ab.updatedAt = Date.now();
                    await ab.save();
                }
            }

            return res.status(200).json({
                success: true,
                story: existing
            });
        }

        // CREATE STORY
        if (!file) {
            return res.status(200).json({
                success: false,
                message: 'coverFile is required'
            });
        }
        if (!voiceLanguage) {
            return res.status(200).json({
                success: false,
                message: 'voiceLanguage is required'
            });
        }

        const storyDoc = new YourStory();
        storyDoc.userId = userId;
        storyDoc.authorId = authorId;
        storyDoc.isAIGenerated = isAIGenerated;
        storyDoc.status = status;
        storyDoc.blueprint = blueprint;
        storyDoc.coverFile = file;
        storyDoc.voiceLanguage = voiceLanguage;
        storyDoc.totalChaptersGenerated = totalChaptersGenerated;
        const story = await storyDoc.save();

        // CREATE LINKED AUDIOBOOK RECORD
        const title = String(blueprint?.storyTitle || 'Untitled AI Story').trim() || 'Untitled AI Story';
        const description = String(blueprint?.storyFoundation || '').trim();
        const genre = String(blueprint?.genre || '').trim();

        const audiobook = new AudioBook();
        audiobook.uploadMethod = 'ai_story';
        audiobook.authorId = author._id;
        audiobook.sourceLanguage = voiceLanguage;
        audiobook.targetLanguage = voiceLanguage;
        audiobook.voiceId = voiceLanguage;
        audiobook.voiceName = voiceLanguage;
        audiobook.voiceGender = '';
        audiobook.voiceUrl = '';
        audiobook.useExpression = false;
        audiobook.speechRate = '1.0';
        audiobook.stability = 50;
        audiobook.clarity = 75;
        audiobook.title = title;
        audiobook.authorName = String(author.penName || '').trim() || 'Author';
        audiobook.description = description;
        audiobook.categories = genre ? [genre] : [];
        audiobook.coverFile = file.filename || '';
        audiobook.coverFileMimetype = file.mimetype || '';
        audiobook.pipelineStatus = 'uploaded';
        audiobook.totalPages = 0;
        audiobook.totalChapters = 0;
        audiobook.totalAudioDurationSec = 0;
        audiobook.audioFiles = [];
        audiobook.published = false;
        audiobook.publishedAt = Date.now();
        const savedAudiobook = await audiobook.save();

        story.audiobookId = savedAudiobook._id;
        story.updatedAt = Date.now();
        await story.save();

        return res.status(200).json({
            success: true,
            story,
            audiobook: savedAudiobook,
        });

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        return res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

module.exports = {
    run
};
