# ElevenLabs Voice Categories - Quick Reference

## Voice Category Breakdown

| Category | Type | Tier | Description | Examples |
|----------|------|------|-------------|----------|
| **premade** | Original | ✅ FREE | Original ElevenLabs voices | Rachel, Domi, Bella (originals) |
| **generated** | AI Default | ✅ FREE | AI-generated default voices | Bella, Roger, Sarah, Laura, Charlie, George, Callum, River, Harry, Liam, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Adam, Bill |
| **professional** | Voice Actors | 💎 PREMIUM | Professional voice actor recordings | Varies by license |
| **cloned** | Custom | 💎 PREMIUM | User-created voice clones | Your custom clones |

## Quick Usage Examples

### Get ALL Voices (Free + Premium)
```javascript
// RECOMMENDED: Automatically fetches all categories
const allVoices = await getVoices();
// Returns all premade + generated + professional + cloned voices
```

### Get Free Voices Only
```javascript
// Method 1: All free voices
const { standard } = await getVoicesByTier();

// Method 2: Specific free categories
const premade = await getVoices({ category: 'premade' });
const generated = await getVoices({ category: 'generated' });
```

### Get Premium Voices Only
```javascript
// Method 1: All premium voices
const { premium } = await getVoicesByTier();

// Method 2: Specific premium categories
const professional = await getVoices({ category: 'professional' });
const cloned = await getVoices({ category: 'cloned' });
```

### Filter by Category + Other Attributes
```javascript
// ALL English female voices (free + premium)
const voices = await getVoices({
    language: 'en',
    gender: 'female'
    // No category = all categories
});

// Free English female voices only
const voices = await getVoices({
    category: 'generated',
    language: 'en',
    gender: 'female'
});

// Premium American male voices
const voices = await getVoices({
    category: 'professional',
    language: 'en',
    gender: 'male',
    accent: 'american'
});
```

## Common Pitfalls ⚠️

### ❌ WRONG: Assuming all 'generated' are premium
```javascript
// This was the bug!
if (voice.category === 'generated') {
    tier = 'premium'; // WRONG!
}
```

### ✅ CORRECT: Check category correctly
```javascript
// generated voices are FREE
const isFree = voice.category === 'premade' || voice.category === 'generated';
const isPremium = voice.category === 'professional' || voice.category === 'cloned';
```

## API Parameters

### GET /v1/voices

**Query Parameters:**
```
?page_size=100         (max: 100, default: 100)
&category=generated    (premade|generated|professional|cloned)
```

**Example:**
```bash
curl "https://api.elevenlabs.io/v1/voices?category=generated&page_size=100" \
  -H "xi-api-key: YOUR_API_KEY"
```

## Testing

Run the debug script to verify:
```bash
node debug-voices.js
```

Expected output:
- Standard voices: 24+ (premade + generated)
- Premium voices: varies (professional + cloned)

## Key Takeaways

✅ **FREE Categories:**
- `premade` - Original ElevenLabs voices
- `generated` - AI default voices (this was the bug!)

💎 **PREMIUM Categories:**
- `professional` - Voice actor recordings
- `cloned` - Custom user clones

🔍 **Filtering:**
- **NO category parameter**: Automatically fetches ALL 4 categories (premade, generated, professional, cloned)
- **WITH category parameter**: Fetches only that specific category
- Combine with `language`, `gender`, `accent`, `age` filters
- Maximum `page_size` is 100 per category

🐛 **Bug Fixed:**
- Generated voices now correctly classified as FREE
- Tier detection prioritizes free status first
- Dual-status voices handled correctly

⚡ **Performance Note:**
- Calling `getVoices()` without category makes 4 API calls (one per category)
- Results are automatically deduplicated
- If you only need one category, specify it to save API calls

## Need Help?

See full documentation in:
- `ELEVENLABS_API_UPDATES.md` - Complete technical documentation
- `elevenlabs-category-examples.js` - Working code examples
- `elevenlabs-utils.js` - Updated implementation