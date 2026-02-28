async function run(data, req, res) {
    try {
        const {
            storyId,
            chapterNumber,
            regenerationInstructions
        } = data;

        const userId = req.userId || null;
        if (!userId || !storyId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const YourStory = require('../models/your_story');
        const YourStoryChapter = require('../models/your_story_chapter');
        const YourStoryChapterMemory = require('../models/your_story_chapter_memory');
        const OpenAiUtils = require('../workers/open-ai-utils');

        const story = await YourStory.findOne({
            _id: storyId,
            userId,
            enabled: true
        });

        if (!story) {
            return res.status(200).json({
                success: false,
                message: 'Invalid story'
            });
        }

        const lastChapter = await YourStoryChapter.findOne({
            storyId: story._id,
            enabled: true,
        }).sort({ chapterNumber: -1 });

        const requestedChapterNumber = Number(chapterNumber || 0);
        const isRegeneration = requestedChapterNumber > 0;

        if (isRegeneration && story.audiobookId) {
            const AudioBook = require('../models/audiobook');
            const ab = await AudioBook.findOne({
                _id: story.audiobookId,
                enabled: true
            });
            const hasAudio = !!ab?.audioFiles?.some((item) => Number(item.chapter) === requestedChapterNumber);
            if (hasAudio) {
                return res.status(200).json({
                    success: false,
                    message: 'Delete generated audio for this chapter before regenerating text.'
                });
            }
        }

        const totalFromStory = Number(story.totalChaptersGenerated || 0);
        const totalFromChapters = Number(lastChapter?.chapterNumber || 0);
        const nextChapterNumber = isRegeneration
            ? requestedChapterNumber
            : Math.max(totalFromStory, totalFromChapters) + 1;
        const chapterLanguage = String(story.chapterLanguage || story.voiceLanguage || 'en').trim() || 'en';

        const existingMemoryRows = await YourStoryChapterMemory.find({
            storyId: story._id,
            enabled: true,
        }).sort({ chapterNumber: 1 });

        const condensedMemory = OpenAiUtils.buildCondensedMemoryBlock(existingMemoryRows);

        const blueprintEnrichment = await OpenAiUtils.openAiEnrichBlueprint({
            blueprint: story.blueprint || {},
            condensedMemory,
            targetLanguage: chapterLanguage,
        });
        if (blueprintEnrichment?.updated) {
            story.blueprint = {
                ...(story.blueprint || {}),
                ...(blueprintEnrichment.blueprintPatch || {}),
            };
            story.updatedAt = Date.now();
            story.markModified('blueprint');
            await story.save();
        }

        story.status = 'publishing';
        story.updatedAt = Date.now();
        await story.save();

        const chapterPayload = await OpenAiUtils.openAiCreateChapter({
            storyRecord: story,
            chapterNumber: nextChapterNumber,
            condensedMemory,
            regenerationInstructions,
            targetLanguage: chapterLanguage,
        });

        let chapter = await YourStoryChapter.findOne({
            storyId: story._id,
            chapterNumber: nextChapterNumber,
            enabled: true,
        });

        if (chapter) {
            chapter.title = chapterPayload.title;
            chapter.summary = chapterPayload.summary;
            chapter.content = chapterPayload.content;
            chapter.characterProgression = chapterPayload.characterProgression;
            chapter.hooksForNextChapter = chapterPayload.hooksForNextChapter;
            chapter.regenerationInstructions = String(regenerationInstructions || chapter.regenerationInstructions || '');
            chapter.wordCount = chapterPayload.wordCount;
            chapter.aiModelUsed = chapterPayload.aiModelUsed;
            chapter.updatedAt = Date.now();
            await chapter.save();
        } else {
            const doc = new YourStoryChapter();
            doc.storyId = story._id;
            doc.chapterNumber = nextChapterNumber;
            doc.title = chapterPayload.title;
            doc.summary = chapterPayload.summary;
            doc.content = chapterPayload.content;
            doc.characterProgression = chapterPayload.characterProgression;
            doc.hooksForNextChapter = chapterPayload.hooksForNextChapter;
            doc.regenerationInstructions = String(regenerationInstructions || '');
            doc.wordCount = chapterPayload.wordCount;
            doc.aiModelUsed = chapterPayload.aiModelUsed;
            chapter = await doc.save();
        }

        const memoryText = await OpenAiUtils.openAiSummarizeChapterMemory({
            storyRecord: story,
            chapterNumber: nextChapterNumber,
            chapterText: chapterPayload.content,
            chapterSummary: chapterPayload.summary,
            priorCondensedMemory: condensedMemory,
            targetLanguage: chapterLanguage,
        });

        let memoryRecord = await YourStoryChapterMemory.findOne({
            storyId: story._id,
            chapterNumber: nextChapterNumber,
            enabled: true,
        });

        if (memoryRecord) {
            memoryRecord.memory = memoryText;
            memoryRecord.updatedAt = Date.now();
            await memoryRecord.save();
        } else {
            const memoryDoc = new YourStoryChapterMemory();
            memoryDoc.storyId = story._id;
            memoryDoc.chapterNumber = nextChapterNumber;
            memoryDoc.memory = memoryText;
            memoryRecord = await memoryDoc.save();
        }

        story.totalChaptersGenerated = Math.max(Number(story.totalChaptersGenerated || 0), nextChapterNumber);
        story.status = 'published';
        story.updatedAt = Date.now();
        await story.save();

        const refreshedMemoryRows = await YourStoryChapterMemory.find({
            storyId: story._id,
            enabled: true,
        }).sort({ chapterNumber: 1 });

        const condensedMemoryAfterAppend = OpenAiUtils.buildCondensedMemoryBlock(refreshedMemoryRows);

        return res.status(200).json({
            success: true,
            story,
            chapter,
            memory: memoryRecord,
            condensedMemory: condensedMemoryAfterAppend,
            blueprintEnrichment: blueprintEnrichment || null,
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
