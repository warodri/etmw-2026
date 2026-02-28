const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');
const axios = require('axios');
const ElevenLabsUtils = require('../workers/eleven_labs_utils');
const AudioBookConvertTask = require('./audiobook_convert_to_mp3');

async function run(data, req, res) {
    let referenceAudioPath = null;
    try {
        const {
            storyId,
            chapterNumber,
            voiceId,
            voiceName,
            voiceUrl,
            voiceLanguage,
            narrationStyle
        } = data || {};

        const userId = req.userId || null;
        if (!userId || !storyId || !chapterNumber) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const chapterNo = Number(chapterNumber);
        if (!Number.isFinite(chapterNo) || chapterNo <= 0) {
            return res.status(200).json({
                success: false,
                message: 'Invalid chapter number'
            });
        }

        const YourStory = require('../models/your_story');
        const YourStoryChapter = require('../models/your_story_chapter');
        const AudioBook = require('../models/audiobook');
        const Story = require('../models/story');
        const Author = require('../models/author');

        const story = await YourStory.findOne({
            _id: storyId,
            userId,
            enabled: true
        });
        if (!story || !story.audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid story'
            });
        }

        const chapter = await YourStoryChapter.findOne({
            storyId: story._id,
            chapterNumber: chapterNo,
            enabled: true
        });
        if (!chapter || !String(chapter.content || '').trim()) {
            return res.status(200).json({
                success: false,
                message: 'Chapter text not found'
            });
        }

        const audiobook = await AudioBook.findOne({
            _id: story.audiobookId,
            enabled: true
        });
        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Invalid audiobook'
            });
        }

        const author = await Author.findOne({
            _id: story.authorId,
            enabled: true
        });
        if (!author) {
            return res.status(200).json({
                success: false,
                message: 'Invalid author alias'
            });
        }

        referenceAudioPath = await resolveReferenceAudioPath(voiceUrl);
        const language = String(voiceLanguage || story.voiceLanguage || audiobook.targetLanguage || audiobook.sourceLanguage || 'en');

        const audioBuffer = await ElevenLabsUtils.textToSpeech({
            text: String(chapter.content || ''),
            language,
            narrationStyle: String(narrationStyle || 'Essay'),
            referenceAudioPath
        });

        const audiobookId = String(audiobook._id);
        const filename = `chapter_${chapterNo}_${Date.now()}.wav`;
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

        const relativeUrl = `audiobooks/${audiobookId}/${filename}`;
        const audioFiles = Array.isArray(audiobook.audioFiles) ? [...audiobook.audioFiles] : [];
        const idx = audioFiles.findIndex((item) => Number(item.chapter) === chapterNo);
        const chapterAudio = {
            chapter: chapterNo,
            url: relativeUrl,
            durationSec
        };
        if (idx >= 0) audioFiles[idx] = chapterAudio;
        else audioFiles.push(chapterAudio);
        audioFiles.sort((a, b) => Number(a.chapter || 0) - Number(b.chapter || 0));

        audiobook.audioFiles = audioFiles;
        audiobook.totalChapters = Math.max(
            Number(story.totalChaptersGenerated || 0),
            ...audioFiles.map((item) => Number(item.chapter || 0))
        );
        audiobook.totalAudioDurationSec = audioFiles.reduce((sum, item) => sum + Number(item.durationSec || 0), 0);

        if (voiceId) audiobook.voiceId = String(voiceId);
        if (voiceName) audiobook.voiceName = String(voiceName);
        if (voiceUrl) audiobook.voiceUrl = String(voiceUrl);
        if (voiceLanguage) audiobook.targetLanguage = String(voiceLanguage);
        audiobook.updatedAt = Date.now();
        await audiobook.save();

        await Story.deleteMany({
            audiobookId: audiobookId,
            chapterNumber: chapterNo
        });
        await cleanupGeneratedStoryAssets(audiobookId, chapterNo);

        const generatedStory = await AudioBookConvertTask.generateStory(audiobook, author, {
            text: String(chapter.content || ''),
            chapterNumber: chapterNo,
            totalChapters: Number(story.totalChaptersGenerated || chapterNo || 1),
            sourceLanguage: language,
            targetLanguage: language,
            language,
            narrationStyle: String(narrationStyle || 'Essay'),
            referenceAudioPath
        });

        return res.status(200).json({
            success: true,
            chapterAudio,
            generatedStory: generatedStory || null
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        return res.status(200).json({
            success: false,
            message: ex.message || 'Unexpected error'
        });
    } finally {
        if (referenceAudioPath && referenceAudioPath.includes('/tmp/')) {
            try {
                await fs.unlink(referenceAudioPath);
            } catch {
                // no-op
            }
        }
    }
}

async function resolveReferenceAudioPath(voiceUrl) {
    const source = String(voiceUrl || '').trim();
    if (!source) return null;
    if (source.startsWith('http://') || source.startsWith('https://')) {
        const response = await axios.get(source, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        const ext = detectExtFromUrlOrContentType(source, response.headers?.['content-type']);
        const filePath = path.join('/tmp', `voice_ref_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`);
        await fs.writeFile(filePath, Buffer.from(response.data));
        return filePath;
    }
    if (path.isAbsolute(source)) {
        return source;
    }
    return null;
}

function detectExtFromUrlOrContentType(url, contentType) {
    const lowerUrl = String(url || '').toLowerCase();
    if (lowerUrl.endsWith('.wav')) return '.wav';
    if (lowerUrl.endsWith('.mp3')) return '.mp3';
    const ct = String(contentType || '').toLowerCase();
    if (ct.includes('audio/wav') || ct.includes('audio/x-wav')) return '.wav';
    if (ct.includes('audio/mpeg')) return '.mp3';
    return '.wav';
}

async function cleanupGeneratedStoryAssets(audiobookId, chapterNumber) {
    const chapterPrefix = `story_${chapterNumber}_`;
    const audioDir = path.join(__dirname, '../audiobooks/story', String(audiobookId));
    const imageDir = path.join(__dirname, '../audiobooks/story/images', String(audiobookId));
    await removeFilesByPrefix(audioDir, chapterPrefix);
    await removeFilesByPrefix(imageDir, chapterPrefix);
}

async function removeFilesByPrefix(dir, prefix) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isFile()) continue;
            if (!entry.name.startsWith(prefix)) continue;
            const filePath = path.join(dir, entry.name);
            await fs.unlink(filePath).catch(() => {});
        }
    } catch {
        // no-op
    }
}

module.exports = {
    run
};

