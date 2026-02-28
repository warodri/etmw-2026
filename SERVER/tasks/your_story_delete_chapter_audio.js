const fs = require('fs').promises;
const path = require('path');

async function run(data, req, res) {
    try {
        const {
            storyId,
            chapterNumber
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
        const AudioBook = require('../models/audiobook');
        const Story = require('../models/story');

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

        const audiobookId = String(audiobook._id);
        const audioFiles = Array.isArray(audiobook.audioFiles) ? [...audiobook.audioFiles] : [];
        const idx = audioFiles.findIndex((item) => Number(item.chapter) === chapterNo);
        if (idx >= 0) {
            const selected = audioFiles[idx];
            const filePath = path.join(__dirname, '..', String(selected.url || ''));
            audioFiles.splice(idx, 1);
            try {
                await fs.unlink(filePath);
            } catch {
                // no-op
            }
        }

        audiobook.audioFiles = audioFiles;
        audiobook.totalAudioDurationSec = audioFiles.reduce(
            (sum, item) => sum + Number(item.durationSec || 0),
            0
        );
        audiobook.totalChapters = Math.max(
            Number(story.totalChaptersGenerated || 0),
            ...audioFiles.map((item) => Number(item.chapter || 0)),
            0
        );
        audiobook.updatedAt = Date.now();
        await audiobook.save();

        await Story.deleteMany({
            audiobookId: audiobookId,
            chapterNumber: chapterNo
        });
        await cleanupGeneratedStoryAssets(audiobookId, chapterNo);

        return res.status(200).json({
            success: true
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        return res.status(200).json({
            success: false,
            message: ex.message || 'Unexpected error'
        });
    }
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
            await fs.unlink(path.join(dir, entry.name)).catch(() => {});
        }
    } catch {
        // no-op
    }
}

module.exports = {
    run
};

