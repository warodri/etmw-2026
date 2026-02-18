const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');
const elevenLabsUtils = require('../workers/eleven_labs_utils');
const config = require('../config');
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: config.OPEN_AI.API_KEY });

/**
 * THIS IS EXECUTED FORM OUR PRIVATE UI "app/admin"
 * 
 * 1) I converts the chapter to MP3
 * 2) Generates the Story
 * 
 */
async function run(data, req, res) {
    try {
        const payload = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
        const {
            audiobookId,
            params,
        } = payload;

        //  Validate
        if (!audiobookId || !params) {
            return res.json({ 
                success: false, 
                message: 'Missing parameters' 
            });
        }

        //  Find the audiobook and validate
        const AudioBook = require('../models/audiobook');        
        const audiobook = await AudioBook.findOne({ 
            _id: audiobookId,
            enabled: true 
        })
        if (!audiobook) {
            return res.status(200).json({
                success: false,
            })
        }

        //  Update total chapters and total pages
        if (params.totalPages) {
            audiobook.totalPages = params.totalPages;
        }
        if (params.totalChapters) {
            audiobook.totalChapters = params.totalChapters;
        }
        if (params.totalPages || params.totalChapters) {
            await audiobook.save();
        }

        //  Chapter number to process
        const chapterNumber = Number(params.chapterNumber || 0);
        if (!chapterNumber || chapterNumber <= 0) {
            return res.json({ 
                success: false, 
                message: 'Invalid chapter number' 
            });
        }

        //  Convert to audio
        const audioBuffer = await elevenLabsUtils.textToSpeech(params);

        // Create directory for audiobook if it doesn't exist
        const audiobookDir = path.join(__dirname, '../audiobooks', audiobookId);
        await fs.mkdir(audiobookDir, { recursive: true });

        // Generate filename
        const filename = `chapter_${chapterNumber}_${Date.now()}.mp3`;
        const filepath = path.join(audiobookDir, filename);

        // Save MP3 file
        await fs.writeFile(filepath, audioBuffer);

        // Get audio duration
        let durationSec = 0;
        try {
            const metadata = await mm.parseFile(filepath);
            durationSec = metadata.format.duration || 0;
        } catch (err) {
            console.warn('Could not get audio duration:', err);
        }

        // Update audiobook record
        const relativeUrl = `audiobooks/${audiobookId}/${filename}`;
            
        // Check if chapter already exists
        const audioFiles = Array.isArray(audiobook.audioFiles) ? audiobook.audioFiles : [];
        const existingChapterIndex = audioFiles.findIndex(
            file => file.chapter === chapterNumber
        );

        if (existingChapterIndex >= 0) {
            // Update existing chapter
            audioFiles[existingChapterIndex] = {
                chapter: chapterNumber,
                url: relativeUrl,
                durationSec: durationSec
            };
        } else {
            // Add new chapter
            audioFiles.push({
                chapter: chapterNumber,
                url: relativeUrl,
                durationSec: durationSec
            });
        }

        // Sort chapters by chapter number
        audioFiles.sort((a, b) => a.chapter - b.chapter);
        audiobook.audioFiles = audioFiles;

        // Calculate total duration
        audiobook.totalAudioDurationSec = audiobook.audioFiles.reduce(
            (sum, file) => sum + (file.durationSec || 0), 
            0
        );

        // Update pipeline status
        if (audiobook.pipelineStatus === 'uploaded') {
            audiobook.pipelineStatus = 'tts_processing';
        }

        //  Update last time modified
        audiobook.updatedAt = Date.now();
        await audiobook.save();

        //  Get the author
        const Author = require('../models/author');        
        const author = await Author.findOne({ 
            _id: audiobook.authorId,
            enabled: true 
        })
        if (!author) {
            throw new Error('Author does not exist!')
        }
        // Generate the story for this chapter
        await generateStory(audiobook, author, params);

        //  Respond to our UI "app/admin"
        res.json({
            success: true,
            message: 'Conversion successful',
            chapter: {
                chapter: chapterNumber,
                url: relativeUrl,
                durationSec: durationSec
            }
        });

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

async function generateStory(audiobook, author, params) {
    //  Validate
    if (!audiobook || !author || !params) {
        console.log('author', author)
        console.log('audiobook', audiobook)
        console.log('params', params)
        throw new Error('No AUDIOBOOK or AUTHOR or PARAMS')
    }
    if (!params.text || typeof params.text !== 'string' || !params.text.trim()) {
        throw new Error('No chapter text for story generation')
    }
    //  1) Con el texto original y con el idioma original
    //  2) Le digo al AI que tome el texto de input y que genere todo
    let chapterPieces = generate10MinuteText(params.text, audiobook, params, author);
    chapterPieces = await generateStoryTitleAndQuote(audiobook, params, chapterPieces);
    chapterPieces = await generateStoryImages(audiobook, params, chapterPieces);
    chapterPieces = await generate10MinuteAudios(audiobook, params, chapterPieces);
    //  "chapterPieces" is ready to store in mongodb
    await upsertStoryDocument(audiobook, author, params, chapterPieces);
}

/**
 *  - Separe todo el capitulo en textos de approximadamente 10 minutos.  
 * - Genere un titulo llamativo, conflictivo, misterioro.
 * - Le digo que genere un subtitulo.
 * - Le digo que genere un quote.
 * - Le doy ejemplos para todo. 
 */
function generate10MinuteText(text, audiobook, params, author) {
    const chapterPieces = []
    /*
        TODO: The input parameter "text" is the full PDF text of 1 chapter of a book.

        - I need to separate the whole text into 10 minute texts (approx)

        - Return a an array, as follows: 
            chapterPieces: [{ 
                readingText: '....'
            }, { 
                readingText: '...'
            }]
    */
    const minutes = 10;
    const wordsPerMinute = 200;
    const targetWordCount = minutes * wordsPerMinute;
    
    // Normalize spaces
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Split into sentences (keeps the period)
    const sentences = cleanText.match(/[^.?!]+[.?!]+/g) || [];
    let currentChunk = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
        const sentenceWordCount = sentence.trim().split(/\s+/).length;

        if (currentWordCount + sentenceWordCount > targetWordCount) {
            // Push current chunk if not empty
            if (currentChunk.trim().length > 0) {
                chapterPieces.push({
                    readingText: currentChunk.trim(),
                    slideIndex: chapterPieces.length
                });
            }
            // Start new chunk
            currentChunk = sentence + ' ';
            currentWordCount = sentenceWordCount;
        } else {
            currentChunk += sentence + ' ';
            currentWordCount += sentenceWordCount;
        }
    }

    // Push remaining text
    if (currentChunk.trim().length > 0) {
        chapterPieces.push({
            readingText: currentChunk.trim(),
            slideIndex: chapterPieces.length
        });
    }

    // Fallback: no punctuation detected
    if (chapterPieces.length === 0 && cleanText.length > 0) {
        const words = cleanText.split(/\s+/);
        for (let i = 0; i < words.length; i += targetWordCount) {
            const chunk = words.slice(i, i + targetWordCount).join(' ');
            chapterPieces.push({
                readingText: chunk.trim(),
                slideIndex: chapterPieces.length
            });
        }
    }

    return chapterPieces;
}

/**
 * Use Open AI to generate:
 * - title
 * - quote
 */
async function generateStoryTitleAndQuote(audiobook, params, chapterPieces) {
    for (let i = 0; i < chapterPieces.length; i++) {
        const item = chapterPieces[i];
        if (!Number.isFinite(item.slideIndex)) {
            item.slideIndex = i;
        }
        // Call OpenAI to Create a "title" and a "quote". It must be dramatic enough to ge the reader's attention. 
        
        // Example: Provocative sentence
        //     “Most people don’t want freedom. They want safety.”

        // Or Story fragments:
        //     “He left the house barefoot. That was the moment everything changed.”

        // Or a Personal confession:
        //     “I used to believe success meant silence.”

        const response = await openAiGenerateTextandQuote(item.readingText, audiobook, params);
        if (!response) {
            throw new Error('Open AI did not return title and quote')
        }
        item.title = response.title;
        item.subtitle = response.subtitle;
        item.quote = response.quote;
        item.audioImage = '';
        item.audioUrl = '';
        item.audioDuration = 0;
        item.isPlaying = false;
        item.isMuted = false;
        item.progress = 0;
        item.expanded = false;
        item.hasResume = false;
        item.resumeTime = 0;
    }
    return chapterPieces;
}

/**
 * Use Open AI to generate an image or each o the chapters
 * And populate "audioImage"
 */
async function generateStoryImages(audiobook, params, chapterPieces) {
    for (let item of chapterPieces) {
        //  TODO: Call Open AI and generate a catchy captivating phone-size image based on:
        //  - title: 'Most people don’t want freedom. They want safety',
        //  - quote: 'He left the house barefoot. That was the moment everything changed.',
        item.audioImage = await openAiGenerateimage(
            audiobook, params, item.slideIndex, item.title, item.quote
        );
    }
    return chapterPieces;
}
async function openAiGenerateimage(audiobook, params, slideIndex, title, quote) {
    //  Call open AI to generate the image.
    //  Use "client" instantiated above.
    //  Store the image
    const storyDir = path.join(__dirname, '../audiobooks', 'story', 'images', audiobook._id.toString());
    await fs.mkdir(storyDir, { recursive: true });
    const filename = `story_${params.chapterNumber}_${slideIndex}.png`;
    const filepath = path.join(storyDir, filename);

    const prompt = buildImagePrompt(audiobook, params, title, quote);
    const response = await client.responses.create({
        model: "gpt-4.1",
        input: prompt,
        tools: [{ type: "image_generation" }]
    });

    const imageData = extractImageBase64(response);

    if (!imageData) {
        throw new Error('Open AI did not return an image');
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    await fs.writeFile(filepath, imageBuffer);

    return `audiobooks/story/images/${audiobook._id.toString()}/${filename}`;
}

function extractImageBase64(response) {
    if (!response) return null;

    const output = response.output || [];
    for (const item of output) {
        if (item.type === 'image_generation_call' && item.result) {
            return item.result;
        }
        if (item.content && Array.isArray(item.content)) {
            for (const contentItem of item.content) {
                if (contentItem.type === 'image' && contentItem.data) {
                    return contentItem.data;
                }
                if (contentItem.type === 'output_image' && contentItem.image_base64) {
                    return contentItem.image_base64;
                }
            }
        }
    }
    if (response.data && response.data[0] && response.data[0].b64_json) {
        return response.data[0].b64_json;
    }
    return null;
}

/**
 * Use Eleven Labs to generate an the 10-minute audio
 * And populate "audioUrl"
 */
async function generate10MinuteAudios(audiobook, params, chapterPieces) {
    if (!audiobook) {
        throw new Error('No Audiobook!')
    }
    for (let item of chapterPieces) {

        //  This is the 10 minute text to convert to audio
        const readingText = item.readingText;
        if (!readingText) {
            throw new Error('No readingText!')
        }
        const newParams = {
            voiceId: params.voiceId,
            text: readingText,
            modelId: params.modelId,
            stability: params.stability,
            similarity: params.similarity,
            style: params.style,
            speakerBoost: params.speakerBoost,
            outputFormat: params.outputFormat,
            language: params.language || audiobook.targetLanguage || audiobook.sourceLanguage
        }
        const audioBuffer = await elevenLabsUtils.textToSpeech(newParams);

        // Create directory for audiobook if it doesn't exist
        const storyDir = path.join(__dirname, '../audiobooks', 'story', audiobook._id.toString());
        await fs.mkdir(storyDir, { recursive: true });
        
        // Generate filename
        const filename = `story_${params.chapterNumber}_${item.slideIndex}.mp3`;
        const filepath = path.join(storyDir, filename);
        
        // Save MP3 file
        await fs.writeFile(filepath, audioBuffer);

        //  Add to the returning array
        item.audioUrl = `audiobooks/story/${audiobook._id.toString()}/${filename}`;

        // Get audio duration
        let durationSec = 0;
        try {
            const metadata = await mm.parseFile(filepath);
            durationSec = metadata.format.duration || 0;
        } catch (err) {
            console.warn('Could not get audio duration:', err);
        }
        item.audioDuration = durationSec;

    }
    return chapterPieces;
}

async function openAiGenerateTextandQuote(readingText, audiobook, params) {
    const cleanedText = trimPromptText(readingText, 9000);
    const systemPrompt = `You are a creative editor. Create a dramatic, intriguing short title, a short subtitle, and a memorable quote based on the provided text. 

Return ONLY valid JSON with the exact keys: "title", "subtitle", "quote". 
No markdown, no extra text. Keep each field under 160 characters. Avoid spoilers.`;

    const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: cleanedText }
        ],
        temperature: 0.7,
    });

    const content = (completion.choices?.[0]?.message?.content || '').trim();
    const parsed = safeJsonParse(content);

    const title = normalizeString(parsed?.title) || generateFallbackTitle(cleanedText);
    const subtitle = normalizeString(parsed?.subtitle) || '';
    const quote = normalizeString(parsed?.quote) || generateFallbackQuote(cleanedText);

    return { title, subtitle, quote };
}

function buildImagePrompt(audiobook, params, title, quote) {
    const bookTitle = audiobook?.title || 'Untitled';
    const authorName = audiobook?.authorName || '';
    const chapterNumber = params?.chapterNumber || '';
    return `Create a cinematic, story-driven illustration for a mobile screen (portrait 9:16). 
Book title: "${bookTitle}". Author: "${authorName}". Chapter: ${chapterNumber}.
Inspiration title: "${title}". Quote: "${quote}".
Style: high-detail, moody lighting, evocative, no text or lettering, no logos, no watermarks, no borders.`;
}

function trimPromptText(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '...';
}

function safeJsonParse(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (err) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch (err2) {
                return null;
            }
        }
        return null;
    }
}

function normalizeString(value) {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
}

function generateFallbackTitle(text) {
    const sentence = extractFirstSentence(text, 120);
    return sentence || 'Chapter Reflection';
}

function generateFallbackQuote(text) {
    const sentence = extractFirstSentence(text, 140);
    return sentence ? `“${sentence}”` : '“A moment that changes everything.”';
}

function extractFirstSentence(text, maxLen) {
    if (!text) return '';
    const match = text.match(/[^.?!]+[.?!]/);
    const sentence = match ? match[0] : text;
    return sentence.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

async function upsertStoryDocument(audiobook, author, params, chapterPieces) {
    const Story = require('../models/story');
    const chapterNumber = Number(params.chapterNumber || 1);
    const totalChapters = Number(params.totalChapters || audiobook.totalPages || chapterNumber || 1);
    const language = params.language || audiobook.targetLanguage || audiobook.sourceLanguage || 'en';
    const firstPiece = chapterPieces[0] || {};

    const doc = {
        audiobookId: String(audiobook._id),
        chapterNumber: chapterNumber,
        totalChapters: totalChapters,
        language: language,
        chapterPieces: chapterPieces,
        image: firstPiece.audioImage || '',
        author: author.penName || audiobook.authorName || '',
        title: firstPiece.title || audiobook.title || '',
        subtitle: firstPiece.subtitle || '',
        quote: firstPiece.quote || '',
        slideIndex: 0,
        updatedAt: Date.now()
    };

    await Story.findOneAndUpdate(
        { audiobookId: String(audiobook._id), chapterNumber: chapterNumber, language: language },
        doc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}


module.exports = {
    run
}
