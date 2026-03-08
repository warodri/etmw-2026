/**
 * THIS IS FOR ADMIN USERS ONLY.
 * Regenerates the story for a single audiobook chapter.
 */
async function run(data, req, res) {
    try {
        const payload = data || {};
        const audiobookId = String(payload.audiobookId || '').trim();
        const chapterNumber = Number(payload.chapterNumber || 0);
        const password = String(payload.password || '').trim();
        const requestedTargetLanguage = String(payload.targetLanguage || '').trim();
        const narrationStyle = String(payload.narrationStyle || 'Essay').trim() || 'Essay';

        if (!audiobookId || !Number.isFinite(chapterNumber) || chapterNumber <= 0) {
            return res.status(200).json({ success: false, message: 'Invalid data' });
        }

        if (!password || password !== 'car0lina') {
            return res.status(200).json({ success: false, message: 'Invalid user' });
        }

        console.log('[ADMIN_STORY_GEN] start', {
            audiobookId,
            chapterNumber,
            requestedTargetLanguage,
            narrationStyle
        });

        const AudioBook = require('../models/audiobook');
        const Author = require('../models/author');
        const ChapterSource = require('../models/audiobook_chapter_source');
        const Story = require('../models/story');
        const AudioBookConvert = require('./audiobook_convert_to_mp3');

        const audiobook = await AudioBook.findOne({
            _id: audiobookId,
            enabled: true
        });
        if (!audiobook) {
            return res.status(200).json({ success: false, message: 'Invalid audiobook' });
        }

        const author = await Author.findOne({
            _id: audiobook.authorId,
            enabled: true
        });
        if (!author) {
            return res.status(200).json({ success: false, message: 'Invalid author' });
        }

        console.log('[ADMIN_STORY_GEN] loaded entities', {
            audiobookId: String(audiobook._id),
            authorId: String(author._id),
            audiobookTargetLanguage: audiobook.targetLanguage || '',
            audiobookSourceLanguage: audiobook.sourceLanguage || ''
        });

        const preferredLanguage = requestedTargetLanguage || audiobook.targetLanguage || audiobook.sourceLanguage || '';
        const sourceRecord = await pickChapterSourceText(ChapterSource, {
            audiobookId: String(audiobook._id),
            chapterNumber,
            preferredLanguage
        });
        let chapterText = sourceRecord?.finalText || sourceRecord?.inputText || '';

        console.log('[ADMIN_STORY_GEN] source record lookup', {
            found: Boolean(sourceRecord),
            sourceTargetLanguage: sourceRecord?.targetLanguage || '',
            sourceSourceLanguage: sourceRecord?.sourceLanguage || '',
            sourceTextLength: chapterText.length
        });

        // Legacy fallback for old chapters generated before chapter source tracking.
        let sourceStory = null;
        if (!chapterText) {
            const stories = await Story.find({
                audiobookId: String(audiobook._id),
                chapterNumber,
                enabled: true
            }).sort({ updatedAt: -1 });
            sourceStory = pickStoryByLanguage(stories, preferredLanguage) || stories[0] || null;
            chapterText = extractChapterText(sourceStory);
            console.log('[ADMIN_STORY_GEN] fallback story lookup', {
                storiesCount: stories.length,
                pickedStoryId: sourceStory?._id ? String(sourceStory._id) : '',
                fallbackTextLength: chapterText.length
            });
        }

        if (!chapterText) {
            return res.status(200).json({
                success: false,
                message: 'No chapter text available yet. Convert this chapter text first from Admin.'
            });
        }

        const sourceLanguage = String(
            sourceStory?.language || sourceRecord?.sourceLanguage || audiobook.sourceLanguage || 'en'
        );
        const targetLanguage = String(requestedTargetLanguage || sourceRecord?.targetLanguage || sourceLanguage);
        const ttsLanguage = AudioBookConvert.getBaseLanguageCode(
            sourceRecord?.ttsLanguage || targetLanguage
        ) || 'en';
        const resolvedNarrationStyle = String(
            sourceRecord?.narrationStyle || narrationStyle || 'Essay'
        ).trim() || 'Essay';

        let finalText = chapterText;
        const translationApplied = AudioBookConvert.shouldTranslate(sourceLanguage, targetLanguage);
        console.log('[ADMIN_STORY_GEN] language resolution', {
            sourceLanguage,
            targetLanguage,
            ttsLanguage,
            translationApplied,
            chapterTextLength: chapterText.length
        });
        if (translationApplied) {
            finalText = await AudioBookConvert.translateWithOpenAiChunked(
                chapterText,
                sourceLanguage,
                targetLanguage
            );
            console.log('[ADMIN_STORY_GEN] translation completed', {
                finalTextLength: String(finalText || '').length
            });
        }

        console.log('[ADMIN_STORY_GEN] calling generateStory', {
            audiobookId: String(audiobook._id),
            chapterNumber,
            totalChapters: Number(
                sourceRecord?.totalChapters || audiobook.totalChapters || sourceStory?.totalChapters || chapterNumber || 1
            ),
            narrationStyle: resolvedNarrationStyle
        });

        const generatedStory = await AudioBookConvert.generateStory(audiobook, author, {
            text: finalText,
            chapterNumber,
            totalChapters: Number(
                sourceRecord?.totalChapters || audiobook.totalChapters || sourceStory?.totalChapters || chapterNumber || 1
            ),
            sourceLanguage,
            targetLanguage,
            language: ttsLanguage,
            narrationStyle: resolvedNarrationStyle
        });

        console.log('[ADMIN_STORY_GEN] generateStory completed', {
            storyId: generatedStory?._id ? String(generatedStory._id) : '',
            chapterNumber: generatedStory?.chapterNumber,
            language: generatedStory?.language,
            chapterPieces: Array.isArray(generatedStory?.chapterPieces) ? generatedStory.chapterPieces.length : 0
        });

        return res.status(200).json({
            success: true,
            story: generatedStory,
            diagnostics: {
                chapterNumber,
                sourceLanguage,
                targetLanguage,
                ttsLanguage,
                translationApplied,
                inputTextLength: chapterText.length,
                finalTextLength: String(finalText || '').length
            }
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log('[ADMIN_STORY_GEN] error', {
            message: ex.message,
            stack: ex.stack
        });
        return res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

function pickStoryByLanguage(stories, targetLanguage) {
    if (!Array.isArray(stories) || !stories.length) return null;
    const targetBase = getBaseLanguageCode(targetLanguage);
    if (!targetBase) return stories[0] || null;
    return (
        stories.find((story) => getBaseLanguageCode(story?.language) === targetBase) ||
        stories[0] ||
        null
    );
}

function extractChapterText(story) {
    const pieces = Array.isArray(story?.chapterPieces) ? story.chapterPieces : [];
    const segments = pieces
        .map((piece) => String(piece?.readingText || '').trim())
        .filter(Boolean);
    return segments.join('\n\n').trim();
}

function getBaseLanguageCode(code) {
    return String(code || '').trim().toLowerCase().split('-')[0];
}

async function pickChapterSourceText(ChapterSource, {
    audiobookId,
    chapterNumber,
    preferredLanguage
}) {
    const targetBase = getBaseLanguageCode(preferredLanguage);
    const rows = await ChapterSource.find({
        audiobookId,
        chapterNumber,
        enabled: true
    }).sort({ updatedAt: -1 });

    if (!rows.length) return null;
    if (!targetBase) return rows[0];

    return (
        rows.find((row) => getBaseLanguageCode(row?.targetLanguage) === targetBase) ||
        rows.find((row) => getBaseLanguageCode(row?.sourceLanguage) === targetBase) ||
        rows[0]
    );
}

module.exports = {
    run
};
