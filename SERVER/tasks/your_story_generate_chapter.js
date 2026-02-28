const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');
const ElevenLabsUtils = require('../workers/eleven_labs_utils');
const AudioBookConvertTask = require('./audiobook_convert_to_mp3');

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
        const AudioBook = require('../models/audiobook');
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

        const totalFromStory = Number(story.totalChaptersGenerated || 0);
        const totalFromChapters = Number(lastChapter?.chapterNumber || 0);
        const nextChapterNumber = isRegeneration
            ? requestedChapterNumber
            : Math.max(totalFromStory, totalFromChapters) + 1;

        const existingMemoryRows = await YourStoryChapterMemory.find({
            storyId: story._id,
            enabled: true,
        }).sort({ chapterNumber: 1 });

        const condensedMemory = OpenAiUtils.buildCondensedMemoryBlock(existingMemoryRows);

        const blueprintEnrichment = await OpenAiUtils.openAiEnrichBlueprint({
            blueprint: story.blueprint || {},
            condensedMemory,
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

        let generatedAudio = null;
        let storyGeneration = null;
        if (story.audiobookId) {
            generatedAudio = await generateAndStoreChapterAudio({
                story,
                chapter,
                chapterNumber: nextChapterNumber,
                AudioBook
            });

            storyGeneration = await generateChapterStoryAssets({
                story,
                chapter,
                chapterNumber: nextChapterNumber,
                AudioBook
            });
        }

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
            audio: generatedAudio,
            storyGeneration,
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

async function generateChapterStoryAssets({ story, chapter, chapterNumber, AudioBook }) {
    try {
        const audiobook = await AudioBook.findOne({
            _id: story.audiobookId,
            enabled: true
        });
        if (!audiobook) {
            return { success: false, message: 'Audiobook not found' };
        }

        const Author = require('../models/author');
        const author = await Author.findOne({
            _id: story.authorId,
            enabled: true
        });
        if (!author) {
            return { success: false, message: 'Author alias not found' };
        }

        const text = String(chapter?.content || '').trim();
        if (!text) {
            return { success: false, message: 'Empty chapter content' };
        }

        const language = story.voiceLanguage || audiobook.targetLanguage || audiobook.sourceLanguage || 'en';
        const referenceAudioPath = resolveReferenceAudioPath(audiobook.voiceUrl);

        const savedStory = await AudioBookConvertTask.generateStory(audiobook, author, {
            text,
            chapterNumber: Number(chapter?.chapterNumber || chapterNumber),
            totalChapters: Math.max(Number(story.totalChaptersGenerated || 0), Number(chapterNumber || 0)),
            sourceLanguage: language,
            targetLanguage: language,
            language,
            narrationStyle: 'Essay',
            referenceAudioPath
        });

        return {
            success: true,
            storyId: String(savedStory?._id || ''),
            storyChapterNumber: Number(savedStory?.chapterNumber || 0),
            storyLanguage: String(savedStory?.language || '')
        };
    } catch (ex) {
        console.log('Story generation for AI chapter failed:', ex.message);
        return { success: false, message: ex.message };
    }
}

async function generateAndStoreChapterAudio({ story, chapter, chapterNumber, AudioBook }) {
    const audiobook = await AudioBook.findOne({
        _id: story.audiobookId,
        enabled: true
    });
    if (!audiobook) {
        return null;
    }

    const chapterText = String(chapter?.content || '').trim();
    if (!chapterText) {
        return null;
    }

    const language = story.voiceLanguage || audiobook.targetLanguage || audiobook.sourceLanguage || 'en';
    const narrationStyle = 'Essay';
    const referenceAudioPath = resolveReferenceAudioPath(audiobook.voiceUrl);

    const audioBuffer = await ElevenLabsUtils.textToSpeech({
        text: chapterText,
        language,
        narrationStyle,
        referenceAudioPath
    });

    const audiobookId = String(audiobook._id);
    const ts = Date.now();
    const filename = `chapter_${chapterNumber}_${ts}.wav`;
    const audiobookDir = path.join(__dirname, '../audiobooks', audiobookId);
    await fs.mkdir(audiobookDir, { recursive: true });
    const filepath = path.join(audiobookDir, filename);
    await fs.writeFile(filepath, audioBuffer);

    let durationSec = 0;
    try {
        const metadata = await mm.parseFile(filepath);
        durationSec = Number(metadata?.format?.duration || 0);
    } catch (ex) {
        console.log('Could not extract chapter audio duration:', ex.message);
    }

    const url = `audiobooks/${audiobookId}/${filename}`;
    const audioFiles = Array.isArray(audiobook.audioFiles) ? [...audiobook.audioFiles] : [];
    const existingIdx = audioFiles.findIndex((x) => Number(x.chapter) === Number(chapterNumber));
    const item = {
        chapter: Number(chapterNumber),
        url,
        durationSec
    };
    if (existingIdx >= 0) {
        audioFiles[existingIdx] = item;
    } else {
        audioFiles.push(item);
    }
    audioFiles.sort((a, b) => Number(a.chapter || 0) - Number(b.chapter || 0));

    audiobook.audioFiles = audioFiles;
    audiobook.totalChapters = Math.max(
        Number(story.totalChaptersGenerated || 0),
        ...audioFiles.map((x) => Number(x.chapter || 0))
    );
    audiobook.totalAudioDurationSec = audioFiles.reduce(
        (sum, x) => sum + Number(x.durationSec || 0),
        0
    );
    audiobook.updatedAt = Date.now();
    await audiobook.save();

    return item;
}

function resolveReferenceAudioPath(voiceUrl) {
    const candidate = String(voiceUrl || '').trim();
    if (!candidate) {
        return null;
    }
    if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
        return null;
    }
    if (!path.isAbsolute(candidate)) {
        return null;
    }
    return candidate;
}

module.exports = {
    run
};
