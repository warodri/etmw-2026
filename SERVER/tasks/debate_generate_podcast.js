const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const OpenAI = require('openai');

const config = require('../config');
const elevenLabsUtils = require('../workers/eleven_labs_utils');

const openAiClient = new OpenAI({ apiKey: config.OPEN_AI.API_KEY });
const MAX_COMMENTS = 20;
const LANGUAGE_NAMES = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    pl: 'Polish',
    nl: 'Dutch',
    hi: 'Hindi',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    ar: 'Arabic',
    ru: 'Russian'
};

function parsePayload(req, data) {
    let payload = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch (ex) {
            payload = {};
        }
    }
    return payload || {};
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function splitTextIntoChunks(text, maxChars) {
    const clean = String(text || '').trim();
    if (!clean) return [];
    if (clean.length <= maxChars) return [clean];

    const sentences = clean.match(/[^.?!]+[.?!]+/g) || [];
    if (sentences.length === 0) {
        const chunks = [];
        for (let i = 0; i < clean.length; i += maxChars) {
            chunks.push(clean.slice(i, i + maxChars));
        }
        return chunks;
    }

    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
        if ((current + sentence).length > maxChars) {
            if (current.trim()) chunks.push(current.trim());
            current = sentence;
        } else {
            current += sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

function getLanguageName(code) {
    const key = String(code || '').trim().toLowerCase().split('-')[0];
    return LANGUAGE_NAMES[key] || (code || 'English');
}

async function convertTextToSpeechChunked(params) {
    const text = String(params?.text || '').trim();
    if (!text) {
        throw new Error('Empty text for TTS');
    }

    const chunks = splitTextIntoChunks(text, 28000);
    if (chunks.length === 1) {
        return elevenLabsUtils.textToSpeech({ ...params, text });
    }

    const buffers = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const chunkAudio = await elevenLabsUtils.textToSpeech({
            ...params,
            text: chunkText
        });
        buffers.push(chunkAudio);
    }
    return Buffer.concat(buffers);
}

function formatNameFromUser(user, fallback) {
    if (!user) return fallback;
    const first = String(user.firstName || '').trim();
    const last = String(user.lastName || '').trim();
    const full = `${first} ${last}`.trim();
    if (full) return full;
    if (user.email) return String(user.email).split('@')[0];
    return fallback;
}

function buildCommentsBlock(comments, includeUserNames) {
    return comments.map((item, index) => {
        const fallback = `Speaker ${index + 1}`;
        const speakerName = includeUserNames
            ? formatNameFromUser(item.userId, fallback)
            : fallback;

        const relation = item.parentMessageId ? '(reply)' : '(comment)';
        const text = String(item.text || '').replace(/\s+/g, ' ').trim();
        return `${index + 1}. ${speakerName} ${relation}: ${text}`;
    }).join('\n');
}

function buildFallbackScript({ audiobook, authorName, authorBio, commentsBlock }) {
    const cleanDescription = String(audiobook.description || '').trim();
    const intro = [
        `Welcome to the debate podcast for "${audiobook.title || 'Untitled Audiobook'}".`,
        cleanDescription ? cleanDescription : '',
        authorName ? `The author is ${authorName}.` : '',
        authorBio ? `About the author: ${authorBio}` : ''
    ].filter(Boolean).join(' ');

    return `${intro}\n\nCommunity discussion highlights:\n${commentsBlock}`;
}

function buildFallbackScriptWithMode({
    audiobook,
    authorName,
    authorBio,
    commentsBlock,
    shortIntro
}) {
    if (shortIntro) {
        const title = String(audiobook.title || 'Untitled Audiobook').trim();
        const intro = `Welcome back to the debate podcast for "${title}". Here are the latest community highlights.`;
        return `${intro}\n\nCommunity discussion highlights:\n${commentsBlock}`;
    }

    return buildFallbackScript({
        audiobook,
        authorName,
        authorBio,
        commentsBlock
    });
}

async function generateScriptWithOpenAI(params) {
    const {
        audiobook,
        authorName,
        authorBio,
        commentsBlock,
        language,
        shortIntro
    } = params;

    const systemPrompt = `You are a podcast writer.
- Write one cohesive script as plain text for TTS.
- Keep it concise and natural (about 3-6 minutes spoken length).
- Language: ${language || 'English'}.
- If comments are weak or repetitive, avoid over-claiming and keep intro factual.
- Include: brief book intro, brief author intro, short synthesis of the debate, then curated conversational highlights.
- Intro mode: ${shortIntro ? 'SHORT' : 'FULL'}.
- If SHORT: keep intro to 1-2 lines max, do not repeat long author bio or full book description.
- If FULL: include a richer intro with book context and concise author context.
- No markdown, no bullet points, no stage directions, no XML, no JSON.
- Keep profanity toned down while preserving intent.
- End with a short closing line.`;

    const userPrompt = [
        `Audiobook title: ${audiobook.title || ''}`,
        `Audiobook description: ${audiobook.description || ''}`,
        `Author name: ${authorName || ''}`,
        `Author bio: ${authorBio || ''}`,
        '',
        'Debate comments to use:',
        commentsBlock
    ].join('\n');

    const completion = await openAiClient.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0.6,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    });

    return String(completion?.choices?.[0]?.message?.content || '').trim();
}

async function normalizeCommentsToTargetLanguage(comments, targetLanguageCode) {
    const normalizedComments = Array.isArray(comments) ? [...comments] : [];
    if (!normalizedComments.length) return normalizedComments;

    const targetLanguageName = getLanguageName(targetLanguageCode || 'en');
    const inputItems = normalizedComments.map((item, index) => ({
        index,
        text: String(item?.text || '').trim()
    }));

    const systemPrompt = `You are a translator.
- Translate each input text to ${targetLanguageName}.
- Keep meaning and tone.
- Return ONLY JSON in this exact shape: {"items":[{"index":0,"text":"..."}]}.
- Preserve the same indexes and order.
- Do not omit any item.`;

    const userPrompt = JSON.stringify({ items: inputItems });
    const completion = await openAiClient.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    });

    const raw = String(completion?.choices?.[0]?.message?.content || '').trim();
    let parsed = null;
    try {
        parsed = JSON.parse(raw);
    } catch (ex) {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                parsed = JSON.parse(raw.slice(start, end + 1));
            } catch (_ex2) {
                parsed = null;
            }
        }
    }

    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    if (!items.length) return normalizedComments;

    const translatedMap = new Map(
        items.map((it) => [Number(it.index), String(it.text || '').trim()])
    );

    return normalizedComments.map((item, index) => {
        const translated = translatedMap.get(index);
        if (!translated) return item;
        return {
            ...item,
            text: translated
        };
    });
}

function createTimestampFileName() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}.mp3`;
}

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const {
            audiobookId,
            includeUserNames = true,
            voiceId,
            modelId,
            chapterNumber
        } = payload;

        const userId = req.userId;
        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const UserModel = require('../models/user');
        const user = await UserModel.findOne({
            _id: userId,
            enabled: true
        });
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            });
        }

        const adminEmails = Array.isArray(config.ADMIN?.emails) ? config.ADMIN.emails : [];
        const adminSet = new Set(adminEmails.map(normalizeEmail));
        const isAdmin = adminSet.has(normalizeEmail(user.email));
        if (!isAdmin) {
            return res.status(200).json({
                success: false,
                message: 'Only Admin users can generate podcasts'
            });
        }

        const AudioBook = require('../models/audiobook');
        const audiobook = await AudioBook.findOne({
            _id: audiobookId,
            enabled: true
        });
        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Audiobook not found'
            });
        }

        const DebatePodcast = require('../models/debate_podcast');
        const latestPodcast = await DebatePodcast.findOne({
            audiobookId: audiobook._id,
            enabled: true
        }).sort({ createdAt: -1 });

        const existingPodcastCount = await DebatePodcast.countDocuments({
            audiobookId: audiobook._id,
            enabled: true
        });

        let boundaryCreatedAt = 0;
        if (latestPodcast?.lastCommentId) {
            const DebateComment = require('../models/debate_comment');
            const boundaryComment = await DebateComment.findOne({
                _id: latestPodcast.lastCommentId,
                audiobookId: String(audiobook._id),
                enabled: true
            }).select('createdAt');
            boundaryCreatedAt = Number(boundaryComment?.createdAt || 0);
        }

        const DebateComment = require('../models/debate_comment');
        const rawComments = await DebateComment.find({
            audiobookId: String(audiobook._id),
            enabled: true,
            createdAt: { $gt: boundaryCreatedAt },
            text: { $exists: true, $ne: null }
        })
            .sort({ createdAt: 1 })
            .limit(MAX_COMMENTS * 3)
            .populate('userId', 'firstName lastName email');

        const comments = rawComments
            .filter((item) => String(item?.text || '').trim().length > 0)
            .slice(0, MAX_COMMENTS);

        if (comments.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No new text comments available to generate a podcast'
            });
        }

        const Author = require('../models/author');
        const author = await Author.findOne({
            _id: audiobook.authorId,
            enabled: true
        }).populate('userId', 'firstName lastName bio');

        const authorUser = author?.userId || null;
        const authorName = String(
            author?.penName ||
            audiobook.authorName ||
            `${authorUser?.firstName || ''} ${authorUser?.lastName || ''}`.trim()
        ).trim();
        const authorBio = String(author?.bio || authorUser?.bio || '').trim();

        const bookLanguage = audiobook.targetLanguage || audiobook.sourceLanguage || 'en';
        let normalizedComments = comments;
        try {
            normalizedComments = await normalizeCommentsToTargetLanguage(comments, bookLanguage);
        } catch (ex) {
            console.log('Comment language normalization failed, keeping original comment text');
            console.log(ex.message);
        }

        const commentsBlock = buildCommentsBlock(normalizedComments, !!includeUserNames);
        const requestedChapter = Number(chapterNumber || 0);
        const effectiveChapterNumber = requestedChapter > 0
            ? requestedChapter
            : (existingPodcastCount + 1);
        const useShortIntro = effectiveChapterNumber > 1;

        let podcastScript = '';
        try {
            podcastScript = await generateScriptWithOpenAI({
                audiobook,
                authorName,
                authorBio,
                commentsBlock,
                language: bookLanguage,
                shortIntro: useShortIntro
            });
        } catch (ex) {
            console.log('OpenAI script generation failed, using fallback script');
            console.log(ex.message);
        }

        if (!podcastScript) {
            podcastScript = buildFallbackScriptWithMode({
                audiobook,
                authorName,
                authorBio,
                commentsBlock,
                shortIntro: useShortIntro
            });
        }

        const resolvedVoiceId = String(
            voiceId ||
            audiobook.voiceId ||
            'JBFqnCBsd6RMkjVDRZzb'
        );
        const resolvedModelId = String(modelId || 'eleven_turbo_v2');

        const audioBuffer = await convertTextToSpeechChunked({
            voiceId: resolvedVoiceId,
            text: podcastScript,
            modelId: resolvedModelId,
            stability: 0.45,
            similarity: 0.75,
            style: 0.2,
            speakerBoost: true,
            outputFormat: 'mp3_44100_128',
            language: bookLanguage
        });

        const filename = createTimestampFileName();
        const podcastsDir = path.join(__dirname, '..', 'audiobooks', String(audiobook._id), 'podcasts');
        await fsp.mkdir(podcastsDir, { recursive: true });
        const absoluteFilePath = path.join(podcastsDir, filename);
        await fsp.writeFile(absoluteFilePath, audioBuffer);

        const relativeAudioPath = `audiobooks/${String(audiobook._id)}/podcasts/${filename}`;

        const podcastDoc = new DebatePodcast();
        podcastDoc.audiobookId = audiobook._id;
        podcastDoc.firstCommentId = String(comments[0]._id);
        podcastDoc.lastCommentId = String(comments[comments.length - 1]._id);
        podcastDoc.podcastAudioUrl = relativeAudioPath;
        podcastDoc.updatedAt = Date.now();
        await podcastDoc.save();

        return res.status(200).json({
            success: true,
            podcast: podcastDoc,
            commentsUsed: comments.length,
            filePath: relativeAudioPath,
            chapterNumber: effectiveChapterNumber,
            introMode: useShortIntro ? 'short' : 'full'
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
