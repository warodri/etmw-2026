# ElevenLabs API Updates - Voice Categories & Pagination

## Overview
Updated `elevenlabs-utils.js` to support ElevenLabs API voice categorization and pagination features based on official documentation.

## Voice Categories

ElevenLabs categorizes voices into 4 main types:

### 1. **premade**
- Original ElevenLabs professional voices
- Available on free tier
- High-quality, pre-recorded voices
- Example: Rachel, Domi, Bella (original ElevenLabs voices)

### 2. **generated** 
- AI-generated/default voices  
- **Also available on free tier** (this was the bug!)
- Voices created by ElevenLabs AI
- Example: Many default voices like Bella, Roger, Sarah, Laura, Charlie, George, etc.
- **Important**: These are FREE voices, not premium

### 3. **professional**
- Professional voice actor recordings
- Requires paid subscription
- Highest quality voices
- Licensed from professional voice actors

### 4. **cloned**
- User-created voice clones
- Requires paid subscription
- Created using Voice Cloning feature
- Personal or custom voices

## API Changes

### Updated `getVoices()` Function

**New Parameters:**
```javascript
const filters = {
    // Existing filters
    language: 'en',        // Filter by language
    gender: 'male',        // Filter by gender
    accent: 'american',    // Filter by accent
    age: 'young',         // Filter by age
    
    // NEW: API-level filtering
    category: 'premade',   // Filter by voice category (premade, generated, professional, cloned)
    pageSize: 100          // Number of results (max 100, default 100)
};

const voices = await getVoices(filters);
```

**Category Examples:**
```javascript
// Get only free premade voices
const premadeVoices = await getVoices({ category: 'premade' });

// Get only generated/default voices (also free!)
const generatedVoices = await getVoices({ category: 'generated' });

// Get professional voices (premium)
const professionalVoices = await getVoices({ category: 'professional' });

// Get user-cloned voices (premium)
const clonedVoices = await getVoices({ category: 'cloned' });

// Get all voices with pagination
const allVoices = await getVoices({ pageSize: 100 });
```

## Fixed Voice Categorization Bug

### The Problem
Previously, `generated` voices were incorrectly classified as **premium** because the logic treated ALL `generated` category voices as requiring payment.

### The Solution
Updated categorization logic in `getVoicesByTier()`:

```javascript
const isFreeVoice = (
    voice.category === 'premade' ||
    voice.category === 'generated' ||  // DEFAULT VOICES ARE FREE!
    (voice.available_for_tiers && voice.available_for_tiers.includes('free')) ||
    (voice.available_for_tiers && voice.available_for_tiers.length === 0)
);

const isPremiumVoice = (
    voice.category === 'professional' ||  // Professional voices
    voice.category === 'cloned' ||        // User-cloned voices
    voice.fine_tuning ||                  // Fine-tuned voices
    (voice.available_for_tiers && 
     voice.available_for_tiers.length > 0 && 
     !voice.available_for_tiers.includes('free'))
);

// Only mark as premium if it's premium AND NOT free
if (isPremiumVoice && !isFreeVoice) {
    categorized.premium.push(voiceData);
} else {
    categorized.standard.push(voiceData);
}
```

### Voice Tier Detection Priority
1. ✅ **Check if free first** (`premade` OR `generated` OR `available_for_tiers` includes 'free')
2. ✅ **Then check if premium** (`professional` OR `cloned` OR `fine_tuning`)
3. ✅ **Only mark as premium if premium AND NOT free** (prevents conflicts)

## API Endpoint Details

### GET /v1/voices

**Query Parameters:**
- `page_size` (integer): Maximum 100, default 100
- `category` (string): Filter by category (premade, generated, professional, cloned)

**Example Request:**
```javascript
GET https://api.elevenlabs.io/v1/voices?page_size=100&category=generated
Headers:
  xi-api-key: YOUR_API_KEY
```

**Response:**
```json
{
  "voices": [
    {
      "voice_id": "abc123",
      "name": "Bella",
      "category": "generated",
      "labels": {
        "language": "English",
        "accent": "american",
        "gender": "female",
        "age": "young"
      },
      "preview_url": "https://...",
      "available_for_tiers": ["free"],
      "fine_tuning": null
    }
  ]
}
```

## Testing the Fix

Run the debug script to verify categorization:

```bash
node debug-voices.js
```

**Expected Output:**
```
=== VOICE CATEGORIZATION TEST ===

Standard (Free) Voices: 24+
Premium Voices: varies

--- Sample Standard Voices ---
✓ Bella (generated)
✓ Roger (generated)
✓ Sarah (generated)
✓ Rachel (premade)
... etc
```

## Migration Guide

### Before (Incorrect)
```javascript
// This would return NO standard voices if all were 'generated'
const voices = await getVoicesByTier();
// Result: standard = [], premium = [all generated voices] ❌
```

### After (Correct)
```javascript
// Now correctly identifies generated voices as free
const voices = await getVoicesByTier();
// Result: standard = [premade + generated], premium = [professional + cloned] ✅

// Or use category filter
const freeVoices = await getVoices({ category: 'generated' });
// Returns only AI-generated free voices
```

## Common Use Cases

### 1. Get All Free Voices
```javascript
// Method 1: Using tier categorization
const { standard } = await getVoicesByTier();

// Method 2: Using category filters (fetch separately)
const premade = await getVoices({ category: 'premade' });
const generated = await getVoices({ category: 'generated' });
const freeVoices = [...premade, ...generated];
```

### 2. Get Premium Voices Only
```javascript
// Method 1: Using tier categorization
const { premium } = await getVoicesByTier();

// Method 2: Using category filters
const professional = await getVoices({ category: 'professional' });
const cloned = await getVoices({ category: 'cloned' });
const premiumVoices = [...professional, ...cloned];
```

### 3. Get Specific Voice Type
```javascript
// Get only ElevenLabs original voices
const originals = await getVoices({ category: 'premade' });

// Get only AI-generated voices
const aiVoices = await getVoices({ category: 'generated' });

// Get only professional actor voices
const proVoices = await getVoices({ category: 'professional' });

// Get only user clones
const clones = await getVoices({ category: 'cloned' });
```

### 4. Combine Filters
```javascript
// Get free English female voices
const voices = await getVoices({ 
    category: 'generated',
    language: 'en',
    gender: 'female'
});

// Get premium young American male voices
const voices = await getVoices({ 
    category: 'professional',
    language: 'en',
    gender: 'male',
    accent: 'american',
    age: 'young'
});
```

## Summary of Changes

### Files Modified
- ✅ `/mnt/user-data/outputs/elevenlabs-utils.js`
  - Updated `getVoices()` to support `category` and `pageSize` parameters
  - Fixed `getVoicesByTier()` categorization logic for `generated` voices
  - Added proper API query parameter handling

### New Features
- ✅ Category filtering at API level (`premade`, `generated`, `professional`, `cloned`)
- ✅ Pagination control (max 100 results per request)
- ✅ Correct free/premium voice detection

### Bug Fixes
- ✅ **Fixed**: `generated` voices now correctly identified as FREE/standard
- ✅ **Fixed**: Voice tier detection prioritizes free status before premium
- ✅ **Fixed**: Dual-status voices (free AND premium) handled correctly

## Documentation References
- Official ElevenLabs API: https://elevenlabs.io/docs
- Voice Library: https://elevenlabs.io/app/voice-library
- API Endpoint: GET /v1/voices

## Notes
- Maximum page_size is 100 (API enforced)
- Category parameter is optional (omit to get all voices)
- Voice categorization is based on ElevenLabs' internal classification
- `available_for_tiers` field indicates tier availability
- Empty `available_for_tiers` means available to all tiers (including free)