// elevenlabs-utils.js
// Utility functions for ElevenLabs API integration

const config = require('../config');
const fs = require('fs').promises;
const path = require('path');

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const API_KEY = config.ELEVENLABS.API_KEY;

// Cache configuration
const CACHE_DIR = __dirname;
const CACHE_FILE = path.join(CACHE_DIR, 'elevenlabs-voices-cache.json');
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Read cache from file
 * @returns {Promise<Object|null>} - Cached data or null if expired/missing
 */
async function readCache(key = 'all') {
    try {
        const fileExists = await fs.access(CACHE_FILE).then(() => true).catch(() => false);
        
        if (!fileExists) {
            return null;
        }

        const fileContent = await fs.readFile(CACHE_FILE, 'utf8');
        const cache = JSON.parse(fileContent);

        const now = Date.now();
        // Legacy cache format
        if (cache && cache.timestamp && cache.data && !cache.entries) {
            if (key !== 'all') {
                return null;
            }
            if (now - cache.timestamp > CACHE_DURATION) {
                console.log('Cache expired, will fetch fresh data');
                return null;
            }
            console.log('Using cached voices data');
            return cache.data;
        }

        const entry = cache?.entries?.[key];
        if (!entry) {
            return null;
        }
        if (now - entry.timestamp > CACHE_DURATION) {
            console.log('Cache expired, will fetch fresh data');
            return null;
        }

        console.log('Using cached voices data');
        return entry.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

/**
 * Write cache to file
 * @param {Object} data - Data to cache
 */
async function writeCache(key = 'all', data) {
    try {
        let cache = { entries: {} };
        try {
            const fileContent = await fs.readFile(CACHE_FILE, 'utf8');
            const parsed = JSON.parse(fileContent);
            if (parsed?.entries) {
                cache = parsed;
            } else if (parsed?.timestamp && parsed?.data) {
                cache.entries = {
                    all: {
                        timestamp: parsed.timestamp,
                        data: parsed.data
                    }
                };
            }
        } catch {
            // no-op
        }

        cache.entries[key] = {
            timestamp: Date.now(),
            data: data
        };

        await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
        console.log('Voices data cached successfully');
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

/**
 * Clear cache file
 */
async function clearCache() {
    try {
        await fs.unlink(CACHE_FILE);
        console.log('Cache cleared successfully');
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Error clearing cache:', error);
        }
    }
}

/**
 * Get all available voices from ElevenLabs
 * @param {Object} filters - Optional filters {language: 'en', gender: 'male', category: 'premade', pageSize: 100}
 * @returns {Promise<Array>} - Array of voice objects
 */
async function getVoices(filters = {}) {
    try {
        let voices = [];
        
        // If no category specified, fetch ALL categories
        // The API may not return all voice types without explicit category parameter
        if (!filters.category) {
            // Fetch all categories separately and combine
            const categories = ['premade', 'generated', 'professional', 'cloned'];
            const pageSize = Math.min(filters.pageSize || 100, 100);
            
            for (const category of categories) {
                const params = new URLSearchParams();
                params.append('page_size', pageSize.toString());
                params.append('category', category);
                
                const url = `${ELEVENLABS_API_BASE}/voices?${params.toString()}`;
                
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'xi-api-key': API_KEY
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const categoryVoices = data.voices || [];
                        console.log(`Fetched ${categoryVoices.length} voices from category: ${category}`);
                        voices = voices.concat(categoryVoices);
                    } else {
                        console.error(`Failed to fetch ${category} voices: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.error(`Error fetching ${category} voices:`, error.message);
                }
            }
            
            // Remove duplicates by voice_id (in case API returns same voice in multiple categories)
            const uniqueVoices = {};
            voices.forEach(voice => {
                uniqueVoices[voice.voice_id] = voice;
            });
            voices = Object.values(uniqueVoices);
            
        } else {
            // Single category request
            const params = new URLSearchParams();
            const pageSize = Math.min(filters.pageSize || 100, 100);
            params.append('page_size', pageSize.toString());
            params.append('category', filters.category);
            
            const url = `${ELEVENLABS_API_BASE}/voices?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'xi-api-key': API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const data = await response.json();
            voices = data.voices || [];
        }

        // Apply filters if provided
        if (filters.language) {
            voices = voices.filter(voice => {
                // Check if voice has language in labels
                const voiceLanguage = voice.labels?.language?.toLowerCase();
                const requestedLanguage = filters.language.toLowerCase();
                
                // Support both full names and codes
                return voiceLanguage === requestedLanguage ||
                       voiceLanguage?.includes(requestedLanguage) ||
                       requestedLanguage === 'all';
            });
        }

        if (filters.gender) {
            voices = voices.filter(voice => {
                const voiceGender = voice.labels?.gender?.toLowerCase();
                return voiceGender === filters.gender.toLowerCase();
            });
        }

        if (filters.accent) {
            voices = voices.filter(voice => {
                const voiceAccent = voice.labels?.accent?.toLowerCase();
                return voiceAccent?.includes(filters.accent.toLowerCase());
            });
        }

        if (filters.age) {
            voices = voices.filter(voice => {
                const voiceAge = voice.labels?.age?.toLowerCase();
                return voiceAge === filters.age.toLowerCase();
            });
        }

        if (filters.useCase) {
            voices = voices.filter(voice => {
                const voiceUseCase = voice.labels?.use_case?.toLowerCase();
                return voiceUseCase?.includes(filters.useCase.toLowerCase());
            });
        }

        return voices;
    } catch (error) {
        console.error('Error fetching voices:', error);
        throw error;
    }
}

/**
 * Get voices organized by category (standard vs premium)
 * ElevenLabs doesn't have explicit "premium" tier, but we can categorize by:
 * - Pre-made voices (free tier): category = "premade"
 * - Professional voices (paid): category = "professional" 
 * - Cloned voices (paid): category = "cloned"
 * - Generated voices (paid): category = "generated"
 * 
 * @param {Object} filters - Optional filters {language: 'en', gender: 'male', etc.}
 * @param {boolean} forceRefresh - Force bypass cache and fetch fresh data
 * @returns {Promise<Object>} - {standard: [], premium: []}
 */
async function getVoicesByTier(filters = {}, forceRefresh = false) {
    const language = filters.language || null;
    const locale = filters.locale || null;
    const sort = filters.sort || 'trending';
    const category = filters.category || 'high_quality';
    const pageSize = Math.min(filters.pageSize || 100, 100);

    const cacheKey = `shared:${language || 'all'}:${locale || 'all'}:${sort}:${category}:${pageSize}`;

    if (!forceRefresh) {
        const cached = await readCache(cacheKey);
        if (cached) return cached;
    }

    const params = new URLSearchParams();
    params.append('page_size', pageSize.toString());
    params.append('category', category);
    params.append('sort', sort);
    if (language) params.append('language', language);
    if (locale) params.append('locale', locale);

    const url = `${ELEVENLABS_API_BASE}/shared-voices?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'xi-api-key': API_KEY
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const voices = Array.isArray(data?.voices) ? data.voices : [];
    const filteredVoices = voices.filter(voice => {
        if (locale) return voice.locale === locale;
        if (language) return voice.language === language;
        return true;
    });

    const result = filteredVoices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'shared',
        description: voice.description || '',
        labels: {
            gender: voice.gender || '',
            accent: voice.accent || '',
            age: voice.age || '',
            use_case: voice.use_case || '',
            language: voice.language || '',
            locale: voice.locale || ''
        },
        previewUrl: voice.preview_url || null,
        settings: null,
        fineTuning: null,
        availableForTiers: []
    }));

    if (!forceRefresh) {
        await writeCache(cacheKey, result);
    }

    return result;
}


/**
 * Get detailed information about a specific voice
 * @param {string} voiceId - Voice ID
 * @returns {Promise<Object>} - Voice details
 */
async function getVoiceDetails(voiceId) {
    try {
        const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
            method: 'GET',
            headers: {
                'xi-api-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching voice details:', error);
        throw error;
    }
}

/**
 * Download voice sample/preview audio
 * @param {string} previewUrl - Preview URL from voice object
 * @returns {Promise<Buffer>} - Audio buffer
 */
async function downloadVoiceSample(previewUrl) {
    try {
        if (!previewUrl) {
            throw new Error('No preview URL available for this voice');
        }

        const response = await fetch(previewUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download sample: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error downloading voice sample:', error);
        throw error;
    }
}

/**
 * Get available models (includes information about voice expression capabilities)
 * @returns {Promise<Array>} - Array of available models
 */
async function getModels() {
    try {
        const response = await fetch(`${ELEVENLABS_API_BASE}/models`, {
            method: 'GET',
            headers: {
                'xi-api-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
}

/**
 * Check which voices support emotional expression
 * ElevenLabs v2 models support style/emotion control
 * 
 * Expression is controlled through:
 * - style parameter (0.0 to 1.0) - how exaggerated the style is
 * - speaker_boost parameter (true/false) - enhances similarity to original voice
 * 
 * @param {Object} filters - Optional filters {language: 'en', gender: 'male', etc.}
 * @returns {Promise<Object>} - {withExpression: [], withoutExpression: []}
 */
async function getVoicesWithExpression(filters = {}) {
    try {
        const [voices, models] = await Promise.all([
            getVoices(filters),
            getModels()
        ]);

        // Find models that support expression (typically v2 models)
        const expressionModels = models.filter(model => 
            model.can_do_voice_conversion || 
            model.model_id.includes('v2') ||
            model.model_id.includes('turbo')
        );

        const expressionModelIds = expressionModels.map(m => m.model_id);

        const categorized = {
            withExpression: [],
            withoutExpression: []
        };

        voices.forEach(voice => {
            const voiceData = {
                id: voice.voice_id,
                name: voice.name,
                category: voice.category,
                previewUrl: voice.preview_url,
                labels: voice.labels,
                supportedModels: voice.settings?.model_ids || []
            };

            // Check if voice supports any expression-capable models
            const supportsExpression = voiceData.supportedModels.some(modelId =>
                expressionModelIds.includes(modelId)
            );

            if (supportsExpression) {
                categorized.withExpression.push(voiceData);
            } else {
                categorized.withoutExpression.push(voiceData);
            }
        });

        return categorized;
    } catch (error) {
        console.error('Error checking expression support:', error);
        throw error;
    }
}

/**
 * Generate speech with optional expression settings
 * @param {Object} params - {voiceId, text, modelId, stability, similarity, style, speakerBoost}
 * @returns {Promise<Buffer>} - Audio buffer
 */
async function textToSpeech(params) {
    const {
        voiceId,
        text,
        modelId = 'eleven_turbo_v2', // Default to v2 turbo for expression support
        stability = 0.5,
        similarity = 0.75,
        style = 0, // Expression/style exaggeration (0.0 - 1.0)
        speakerBoost = true,
        outputFormat = 'mp3_44100_128'
    } = params;

    try {
        const payload = {
            text: text,
            model_id: modelId,
            voice_settings: {
                stability: stability,
                similarity_boost: similarity,
                style: style, // Only works with v2 models
                use_speaker_boost: speakerBoost
            },
            output_format: outputFormat
        };

        const response = await fetch(
            `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': API_KEY
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TTS error: ${response.status} - ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
        
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

/**
 * Get pricing tier information (helper function)
 * You can use this to determine your custom pricing
 * 
 * @param {Object} voice - Voice object
 * @returns {string} - 'standard' or 'premium'
 */
function getVoicePricingTier(voice) {
    // Check if it's a free/default voice first
    const isFreeVoice = (
        voice.category === 'premade' ||
        voice.category === 'generated' ||
        (voice.available_for_tiers && voice.available_for_tiers.includes('free')) ||
        (voice.available_for_tiers && voice.available_for_tiers.length === 0)
    );
    
    // Check if it's premium
    const isPremiumVoice = (
        voice.category === 'professional' ||
        voice.category === 'cloned' ||
        voice.fine_tuning ||
        (voice.available_for_tiers && 
         voice.available_for_tiers.length > 0 && 
         !voice.available_for_tiers.includes('free'))
    );
    
    // Premium voices that are NOT free = premium tier
    if (isPremiumVoice && !isFreeVoice) {
        return 'premium';
    }
    
    return 'standard';
}

/**
 * Check if expression/style is supported for a voice
 * @param {string} voiceId - Voice ID
 * @returns {Promise<boolean>} - True if expression is supported
 */
async function supportsExpression(voiceId) {
    try {
        const voiceDetails = await getVoiceDetails(voiceId);
        const models = await getModels();
        
        const expressionModels = models.filter(model => 
            model.model_id.includes('v2') || 
            model.model_id.includes('turbo')
        );
        
        const expressionModelIds = expressionModels.map(m => m.model_id);
        
        return voiceDetails.settings?.model_ids?.some(modelId =>
            expressionModelIds.includes(modelId)
        ) || false;
    } catch (error) {
        console.error('Error checking expression support:', error);
        return false;
    }
}

/**
 * Get all available languages from ElevenLabs voices
 * @returns {Promise<Array>} - Array of unique languages with counts
 */
async function getAvailableLanguages() {
    try {
        const voices = await getVoices();
        
        // Collect all languages
        const languageMap = new Map();
        
        voices.forEach(voice => {
            const language = voice.labels?.language;
            if (language) {
                const count = languageMap.get(language) || 0;
                languageMap.set(language, count + 1);
            }
        });
        
        // Convert to array and sort by count
        const languages = Array.from(languageMap.entries())
            .map(([codeOrName, count]) => {
                const code = getLanguageCode(codeOrName);
                return {
                    name: getLanguageName(code), // Get full name from code
                    code: code,
                    count,
                    flag: getLanguageFlag(code)
                };
            })
            .sort((a, b) => b.count - a.count);
        
        return languages;
    } catch (error) {
        console.error('Error getting available languages:', error);
        throw error;
    }
}

/**
 * Helper: Get language code from language name or code
 * @param {string} languageNameOrCode - Full language name or code
 * @returns {string} - Language code
 */
function getLanguageCode(languageNameOrCode) {
    const languageMap = {
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'polish': 'pl',
        'dutch': 'nl',
        'hindi': 'hi',
        'japanese': 'ja',
        'chinese': 'zh',
        'korean': 'ko',
        'arabic': 'ar',
        'russian': 'ru',
        'turkish': 'tr',
        'swedish': 'sv',
        'danish': 'da',
        'norwegian': 'no',
        'finnish': 'fi',
        'czech': 'cs',
        'indonesian': 'id',
        'ukrainian': 'uk',
        'greek': 'el',
        'romanian': 'ro',
        'vietnamese': 'vi',
        'tamil': 'ta',
        'filipino': 'tl',
        'malay': 'ms',
        'slovak': 'sk',
        'bulgarian': 'bg',
        'croatian': 'hr'
    };
    
    const normalized = languageNameOrCode.toLowerCase();
    
    // If it's already a 2-letter code, return it
    if (normalized.length === 2) {
        return normalized;
    }
    
    // Try to map from full name
    return languageMap[normalized] || normalized.substring(0, 2);
}

/**
 * Helper: Get full language name from code
 * @param {string} code - Language code (e.g., 'en', 'es')
 * @returns {string} - Full language name
 */
function getLanguageName(code) {
    const nameMap = {
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
        'ru': 'Russian',
        'tr': 'Turkish',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'cs': 'Czech',
        'id': 'Indonesian',
        'uk': 'Ukrainian',
        'el': 'Greek',
        'ro': 'Romanian',
        'vi': 'Vietnamese',
        'ta': 'Tamil',
        'tl': 'Filipino',
        'ms': 'Malay',
        'sk': 'Slovak',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'bn': 'Bengali',
        'te': 'Telugu',
        'mr': 'Marathi',
        'he': 'Hebrew',
        'hu': 'Hungarian',
        'ca': 'Catalan',
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bs': 'Bosnian',
        'my': 'Burmese',
        'gl': 'Galician',
        'ka': 'Georgian',
        'gu': 'Gujarati',
        'is': 'Icelandic',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'lo': 'Lao',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'mk': 'Macedonian',
        'ml': 'Malayalam',
        'mn': 'Mongolian',
        'ne': 'Nepali',
        'pa': 'Punjabi',
        'sr': 'Serbian',
        'si': 'Sinhala',
        'sl': 'Slovenian',
        'sw': 'Swahili',
        'th': 'Thai',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'cy': 'Welsh'
    };
    
    return nameMap[code.toLowerCase()] || code.toUpperCase();
}

/**
 * Helper: Get flag emoji for language code
 * @param {string} codeOrName - Language code or name
 * @returns {string} - Flag emoji
 */
function getLanguageFlag(codeOrName) {
    const flagMap = {
        'en': '🇬🇧',
        'english': '🇬🇧',
        'es': '🇪🇸',
        'spanish': '🇪🇸',
        'fr': '🇫🇷',
        'french': '🇫🇷',
        'de': '🇩🇪',
        'german': '🇩🇪',
        'it': '🇮🇹',
        'italian': '🇮🇹',
        'pt': '🇵🇹',
        'portuguese': '🇵🇹',
        'pl': '🇵🇱',
        'polish': '🇵🇱',
        'nl': '🇳🇱',
        'dutch': '🇳🇱',
        'hi': '🇮🇳',
        'hindi': '🇮🇳',
        'ja': '🇯🇵',
        'japanese': '🇯🇵',
        'zh': '🇨🇳',
        'chinese': '🇨🇳',
        'ko': '🇰🇷',
        'korean': '🇰🇷',
        'ar': '🇸🇦',
        'arabic': '🇸🇦',
        'ru': '🇷🇺',
        'russian': '🇷🇺',
        'tr': '🇹🇷',
        'turkish': '🇹🇷',
        'sv': '🇸🇪',
        'swedish': '🇸🇪',
        'da': '🇩🇰',
        'danish': '🇩🇰',
        'no': '🇳🇴',
        'norwegian': '🇳🇴',
        'fi': '🇫🇮',
        'finnish': '🇫🇮',
        'cs': '🇨🇿',
        'czech': '🇨🇿',
        'id': '🇮🇩',
        'indonesian': '🇮🇩',
        'uk': '🇺🇦',
        'ukrainian': '🇺🇦',
        'el': '🇬🇷',
        'greek': '🇬🇷',
        'ro': '🇷🇴',
        'romanian': '🇷🇴',
        'vi': '🇻🇳',
        'vietnamese': '🇻🇳',
        'ta': '🇮🇳',
        'tamil': '🇮🇳',
        'tl': '🇵🇭',
        'filipino': '🇵🇭',
        'ms': '🇲🇾',
        'malay': '🇲🇾',
        'sk': '🇸🇰',
        'slovak': '🇸🇰',
        'bg': '🇧🇬',
        'bulgarian': '🇧🇬',
        'hr': '🇭🇷',
        'croatian': '🇭🇷',
        'bn': '🇧🇩',
        'bengali': '🇧🇩',
        'te': '🇮🇳',
        'telugu': '🇮🇳',
        'mr': '🇮🇳',
        'marathi': '🇮🇳',
        'he': '🇮🇱',
        'hebrew': '🇮🇱',
        'hu': '🇭🇺',
        'hungarian': '🇭🇺',
        'ca': '🇪🇸',
        'catalan': '🇪🇸',
        'af': '🇿🇦',
        'afrikaans': '🇿🇦',
        'th': '🇹🇭',
        'thai': '🇹🇭',
        'ur': '🇵🇰',
        'urdu': '🇵🇰'
    };
    
    return flagMap[codeOrName.toLowerCase()] || '🌐';
}

module.exports = {
    getVoices,
    getVoicesByTier,
    getVoiceDetails,
    downloadVoiceSample,
    getModels,
    getVoicesWithExpression,
    textToSpeech,
    getVoicePricingTier,
    supportsExpression,
    getAvailableLanguages,
    getLanguageCode,
    getLanguageName,
    getLanguageFlag,
    clearCache
};
