async function run(data, req, res) {
    try {
        let payload = data || req.body || {};
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch {
                payload = {};
            }
        }

        const storyId = payload.storyId || req.body?.storyId;
        const targetLanguageRaw = payload.targetLanguage || req.body?.targetLanguage || '';
        const narrationStyle = payload.narrationStyle || req.body?.narrationStyle || 'Essay';
        const referenceAudioPath = req.file?.path || null;

        if (!storyId) {
            return res.status(200).json({ success: false, message: 'Missing storyId' });
        }
        if (!targetLanguageRaw) {
            return res.status(200).json({ success: false, message: 'Missing targetLanguage' });
        }
        if (!referenceAudioPath) {
            return res.status(200).json({ success: false, message: 'Missing reference audio file (.wav/.mp3)' });
        }

        const Story = require('../models/story');
        const AudioBook = require('../models/audiobook');
        const Author = require('../models/author');
        const AudioBookConvert = require('./audiobook_convert_to_mp3');

        const currentStory = await Story.findOne({ _id: storyId, enabled: true });
        if (!currentStory) {
            return res.status(200).json({ success: false, message: 'Invalid story' });
        }

        const audiobook = await AudioBook.findOne({
            _id: currentStory.audiobookId,
            enabled: true
        });
        if (!audiobook) {
            return res.status(200).json({ success: false, message: 'Invalid audiobook' });
        }

        const author = await Author.findOne({ _id: audiobook.authorId, enabled: true });
        if (!author) {
            return res.status(200).json({ success: false, message: 'Invalid author' });
        }

        const chapterText = extractChapterText(currentStory);
        if (!chapterText) {
            return res.status(200).json({ success: false, message: 'The selected story has no reading text' });
        }

        const sourceLanguage = String(currentStory.language || audiobook.sourceLanguage || 'en');
        const targetLanguage = String(targetLanguageRaw);
        const ttsLanguage = AudioBookConvert.getBaseLanguageCode(targetLanguage) || 'en';

        let finalText = chapterText;
        const translated = AudioBookConvert.shouldTranslate(sourceLanguage, targetLanguage);
        if (translated) {
            finalText = await AudioBookConvert.translateWithOpenAiChunked(
                chapterText,
                sourceLanguage,
                targetLanguage
            );
        }

        const translatedStory = await AudioBookConvert.generateStory(audiobook, author, {
            text: finalText,
            chapterNumber: Number(currentStory.chapterNumber || 1),
            totalChapters: Number(currentStory.totalChapters || audiobook.totalChapters || currentStory.chapterNumber || 1),
            sourceLanguage,
            targetLanguage,
            language: ttsLanguage,
            narrationStyle,
            referenceAudioPath
        });

        return res.status(200).json({
            success: true,
            story: translatedStory,
            diagnostics: {
                sourceLanguage,
                targetLanguage,
                ttsLanguage,
                translationApplied: translated,
                inputTextLength: chapterText.length,
                finalTextLength: String(finalText || '').length
            }
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

function extractChapterText(story) {
    const pieces = Array.isArray(story?.chapterPieces) ? story.chapterPieces : [];
    const segments = pieces
        .map((piece) => String(piece?.readingText || '').trim())
        .filter(Boolean);
    return segments.join('\n\n').trim();
}

module.exports = {
    run
};

