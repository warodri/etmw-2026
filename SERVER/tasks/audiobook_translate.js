async function run(data, req, res) {
    try {
        const {
            sourceLanguage,
            targetLanguage,
            instructions,
            text,
            password,
        } = data;

        if (!sourceLanguage || !targetLanguage || !text) {
            return res.json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        const userId = req.userId || null;

        //  Validate user
        if (!password || password != 'car0lina') {
            if (!userId) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid user'
                })
            }
        }

        // Perform translation
        const translation = await translateWithOpenAI(
            sourceLanguage,
            targetLanguage,
            instructions || '',
            text
        );

        res.json({
            success: true,
            translation
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


/**
 * Translation handler using AI (Claude API via Anthropic)
 * Add this to your audiobook-handlers.js or create a separate file
 */

const config = require('../config');
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: config.OPEN_AI.API_KEY });

// Language name mapping
const LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'pl': 'Polish',
    'nl': 'Dutch',
    'hi': 'Hindi',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'ru': 'Russian'
};

function getLanguageName(code) {
    return LANGUAGE_NAMES[code] || code;
}

/**
 * Translate text using Open AI
 */
async function translateWithOpenAI(sourceLanguage, targetLanguage, instructions, text) {
    
    const sourceLangName = getLanguageName(sourceLanguage);
    const targetLangName = getLanguageName(targetLanguage);

    const systemPrompt = `You are a professional translator specializing in literary translation. Your task is to translate text from ${sourceLangName} to ${targetLangName}.

Follow these guidelines:
${instructions}

Important: Return ONLY the translated text, without any preamble, explanations, or commentary. Do not include phrases like "Here is the translation" or similar. Just the pure translated text.`;

    try {
        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [{ 
                role: "system", 
                content: systemPrompt 
            }, {
                role: "user", 
                content: `Translate the following text from ${sourceLangName} to ${targetLangName}:\n\n${text}` 
            }],
            temperature: 0,
        })

        const responseText = completion.choices[0].message.content;
        return responseText;

    } catch (error) {
        console.error('Error translating with Open AI:', error);
        throw error;
    }
}

module.exports = {
    run
}