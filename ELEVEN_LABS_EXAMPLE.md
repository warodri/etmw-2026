// elevenlabs-category-examples.js
// Examples of using the new category filtering feature

const { getVoices, getVoicesByTier } = require('./elevenlabs-utils');

/**
 * Example 1: Get ALL voices (free + premium combined)
 */
async function getAllVoices() {
    console.log('=== Getting ALL Voices (Free + Premium) ===\n');
    
    // This automatically fetches all 4 categories:
    // premade, generated, professional, cloned
    const allVoices = await getVoices();
    
    console.log(`Total voices: ${allVoices.length}\n`);
    
    // Count by category
    const categoryCounts = {
        premade: 0,
        generated: 0,
        professional: 0,
        cloned: 0
    };
    
    allVoices.forEach(voice => {
        if (categoryCounts.hasOwnProperty(voice.category)) {
            categoryCounts[voice.category]++;
        }
    });
    
    console.log('Breakdown by category:');
    console.log(`  Premade (original): ${categoryCounts.premade}`);
    console.log(`  Generated (AI default): ${categoryCounts.generated}`);
    console.log(`  Professional: ${categoryCounts.professional}`);
    console.log(`  Cloned: ${categoryCounts.cloned}\n`);
    
    console.log(`FREE voices: ${categoryCounts.premade + categoryCounts.generated}`);
    console.log(`PREMIUM voices: ${categoryCounts.professional + categoryCounts.cloned}\n`);
    
    return allVoices;
}

/**
 * Example 2: Get all free voices (premade + generated)
 */
async function getAllFreeVoices() {
    console.log('=== Getting All Free Voices ===\n');
    
    // Method 1: Using getVoicesByTier (recommended for free vs premium)
    const { standard, premium } = await getVoicesByTier();
    console.log(`Total FREE voices: ${standard.length}`);
    console.log(`Total PREMIUM voices: ${premium.length}\n`);
    
    // Method 2: Fetch by category
    const premadeVoices = await getVoices({ category: 'premade' });
    const generatedVoices = await getVoices({ category: 'generated' });
    
    console.log(`Premade (original ElevenLabs) voices: ${premadeVoices.length}`);
    console.log(`Generated (AI default) voices: ${generatedVoices.length}`);
    console.log(`Total: ${premadeVoices.length + generatedVoices.length}\n`);
    
    return { premadeVoices, generatedVoices };
}

/**
 * Example 3: Get only AI-generated free voices
 */
async function getGeneratedVoices() {
    console.log('=== Getting Generated (AI Default) Voices ===\n');
    
    const voices = await getVoices({ category: 'generated' });
    
    console.log(`Found ${voices.length} generated voices:\n`);
    
    voices.slice(0, 5).forEach(voice => {
        console.log(`- ${voice.name}`);
        console.log(`  ID: ${voice.voice_id}`);
        console.log(`  Gender: ${voice.labels?.gender || 'N/A'}`);
        console.log(`  Language: ${voice.labels?.language || 'N/A'}`);
        console.log(`  Accent: ${voice.labels?.accent || 'N/A'}\n`);
    });
    
    return voices;
}

/**
 * Example 4: Get only professional voices (premium)
 */
async function getProfessionalVoices() {
    console.log('=== Getting Professional Voices (Premium) ===\n');
    
    const voices = await getVoices({ category: 'professional' });
    
    console.log(`Found ${voices.length} professional voices:\n`);
    
    voices.slice(0, 5).forEach(voice => {
        console.log(`- ${voice.name}`);
        console.log(`  ID: ${voice.voice_id}`);
        console.log(`  Description: ${voice.description || 'N/A'}\n`);
    });
    
    return voices;
}

/**
 * Example 5: Get voices with combined filters
 */
async function getFilteredVoices() {
    console.log('=== Getting Filtered Voices ===\n');
    
    // Example: Free English female voices
    const englishFemales = await getVoices({
        category: 'generated',
        language: 'en',
        gender: 'female'
    });
    
    console.log(`Free English Female voices: ${englishFemales.length}\n`);
    
    englishFemales.slice(0, 3).forEach(voice => {
        console.log(`- ${voice.name} (${voice.labels?.accent || 'N/A'})`);
    });
    
    console.log('\n');
    
    // Example: Premium American male voices
    const americanMales = await getVoices({
        category: 'professional',
        language: 'en',
        gender: 'male',
        accent: 'american'
    });
    
    console.log(`Premium American Male voices: ${americanMales.length}\n`);
    
    americanMales.slice(0, 3).forEach(voice => {
        console.log(`- ${voice.name} (${voice.labels?.age || 'N/A'})`);
    });
    
    return { englishFemales, americanMales };
}

/**
 * Example 6: Compare voice categories
 */
async function compareCategories() {
    console.log('=== Voice Category Comparison ===\n');
    
    const categories = ['premade', 'generated', 'professional', 'cloned'];
    const results = {};
    
    for (const category of categories) {
        const voices = await getVoices({ category });
        results[category] = voices.length;
        
        console.log(`${category.toUpperCase()}: ${voices.length} voices`);
        console.log(`  Type: ${getCategoryDescription(category)}`);
        console.log(`  Tier: ${getCategoryTier(category)}\n`);
    }
    
    return results;
}

/**
 * Example 7: Search for specific voice by name across categories
 */
async function findVoiceByName(voiceName) {
    console.log(`=== Searching for "${voiceName}" ===\n`);
    
    // Get all voices
    const allVoices = await getVoices({ pageSize: 100 });
    
    // Find matching voice
    const found = allVoices.find(v => 
        v.name.toLowerCase() === voiceName.toLowerCase()
    );
    
    if (found) {
        console.log('✓ Voice Found!');
        console.log(`  Name: ${found.name}`);
        console.log(`  ID: ${found.voice_id}`);
        console.log(`  Category: ${found.category}`);
        console.log(`  Tier: ${getCategoryTier(found.category)}`);
        console.log(`  Gender: ${found.labels?.gender || 'N/A'}`);
        console.log(`  Language: ${found.labels?.language || 'N/A'}`);
        console.log(`  Accent: ${found.labels?.accent || 'N/A'}`);
        console.log(`  Age: ${found.labels?.age || 'N/A'}\n`);
        
        if (found.preview_url) {
            console.log(`  Preview: ${found.preview_url}\n`);
        }
    } else {
        console.log(`✗ Voice "${voiceName}" not found\n`);
    }
    
    return found;
}

/**
 * Example 8: Get pagination example (max 100)
 */
async function paginationExample() {
    console.log('=== Pagination Example ===\n');
    
    // Get first 50 voices
    const batch1 = await getVoices({ pageSize: 50 });
    console.log(`First batch: ${batch1.length} voices`);
    
    // Get maximum (100 voices)
    const batch2 = await getVoices({ pageSize: 100 });
    console.log(`Maximum batch: ${batch2.length} voices`);
    
    // Note: If you need more than 100, you'll need to implement
    // offset/cursor-based pagination (check API docs for details)
    
    console.log('\n');
}

// Helper functions
function getCategoryDescription(category) {
    const descriptions = {
        premade: 'Original ElevenLabs voices',
        generated: 'AI-generated default voices',
        professional: 'Professional voice actors',
        cloned: 'User-created voice clones'
    };
    return descriptions[category] || 'Unknown';
}

function getCategoryTier(category) {
    const freeTiers = ['premade', 'generated'];
    return freeTiers.includes(category) ? 'FREE' : 'PREMIUM';
}

// Main demo runner
async function runAllExamples() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ElevenLabs Category Filter Examples  ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    try {
        // Run all examples
        await getAllVoices();
        await getAllFreeVoices();
        await getGeneratedVoices();
        await getProfessionalVoices();
        await getFilteredVoices();
        await compareCategories();
        await findVoiceByName('Bella');
        await paginationExample();
        
        console.log('✓ All examples completed successfully!\n');
    } catch (error) {
        console.error('Error running examples:', error);
    }
}

// Export functions for use in other scripts
module.exports = {
    getAllVoices,
    getAllFreeVoices,
    getGeneratedVoices,
    getProfessionalVoices,
    getFilteredVoices,
    compareCategories,
    findVoiceByName,
    paginationExample,
    runAllExamples
};

// Run examples if executed directly
if (require.main === module) {
    runAllExamples();
}