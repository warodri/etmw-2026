// elevenlabs.interfaces.ts
// TypeScript interfaces for ElevenLabs API responses and data structures

/**
 * Voice Labels - metadata about the voice
 */
export interface VoiceLabels {
    language?: string;
    gender?: string;
    accent?: string;
    age?: string;
    use_case?: string;
    description?: string;
    [key: string]: string | undefined;
}

/**
 * Voice Settings - configuration for voice synthesis
 */
export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
    model_ids?: string[];
}

/**
 * Fine Tuning - advanced voice customization
 */
export interface FineTuning {
    language?: string;
    is_allowed_to_fine_tune?: boolean;
    finetuning_state?: string;
    verification_attempts?: any[];
    verification_failures?: string[];
    verification_attempts_count?: number;
    slice_ids?: string[];
    manual_verification?: any;
    manual_verification_requested?: boolean;
}

/**
 * Voice Sharing - sharing settings for voice
 */
export interface VoiceSharing {
    status?: string;
    history_item_sample_id?: string;
    original_voice_id?: string;
    public_owner_id?: string;
    liked_by_count?: number;
    cloned_by_count?: number;
    name?: string;
    description?: string;
    labels?: { [key: string]: string };
    review_status?: string;
    review_message?: string;
    enabled_in_library?: boolean;
}

/**
 * Single Voice object from ElevenLabs API
 */
export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category: 'premade' | 'cloned' | 'generated' | 'professional' | string;
    description?: string;
    labels?: VoiceLabels;
    preview_url?: string;
    available_for_tiers?: string[];
    settings?: VoiceSettings;
    sharing?: VoiceSharing;
    fine_tuning?: FineTuning;
    high_quality_base_model_ids?: string[];
    safety_control?: string;
    voice_verification?: any;
    permission_on_resource?: string;
    is_owner?: boolean;
    is_legacy?: boolean;
}

/**
 * Response from /voices endpoint
 */
export interface GetVoicesResponse {
    voices: ElevenLabsVoice[];
}

/**
 * Model object from ElevenLabs API
 */
export interface ElevenLabsModel {
    model_id: string;
    name: string;
    description: string;
    can_be_finetuned?: boolean;
    can_do_text_to_speech?: boolean;
    can_do_voice_conversion?: boolean;
    can_use_style?: boolean;
    can_use_speaker_boost?: boolean;
    serves_pro_voices?: boolean;
    token_cost_factor?: number;
    languages?: Array<{ language_id: string; name: string }>;
    max_characters_request_free_user?: number;
    max_characters_request_subscribed_user?: number;
}

/**
 * Response from /models endpoint
 */
export interface GetModelsResponse {
    models: ElevenLabsModel[];
}

/**
 * Language information
 */
export interface Language {
    name: string;
    code: string;
    count: number;
    flag: string;
}

/**
 * Processed voice data with pricing
 */
export interface ProcessedVoice {
    id: string;
    name: string;
    category: string;
    description?: string;
    labels?: VoiceLabels;
    previewUrl?: string | null;
    settings?: VoiceSettings | null;
    fineTuning?: FineTuning | null;
    availableForTiers?: string[];
}

/**
 * Voice categorized by tier (standard/premium)
 */
export interface VoicesByTier {
    standard: ProcessedVoice[];
    premium: ProcessedVoice[];
}

/**
 * Voice with expression support info
 */
export interface VoiceWithExpressionInfo {
    id: string;
    name: string;
    category: string;
    previewUrl?: string | null;
    labels?: VoiceLabels;
    supportedModels: string[];
}

/**
 * Voices categorized by expression support
 */
export interface VoicesByExpression {
    withExpression: VoiceWithExpressionInfo[];
    withoutExpression: VoiceWithExpressionInfo[];
}

/**
 * UI-ready voice data with pricing
 */
export interface UIVoiceData {
    id: string;
    name: string;
    gender?: string;
    accent?: string;
    age?: string;
    category: string;
    previewUrl?: string | null;
    supportsExpression: boolean;
    pricing: {
        base: number;
        withExpression: number;
    };
}

/**
 * Complete UI data for voice selection
 */
export interface VoiceSelectionUIData {
    language?: string;
    standard: UIVoiceData[];
    premium: UIVoiceData[];
}

/**
 * Text-to-speech request parameters
 */
export interface TextToSpeechParams {
    voiceId: string;
    text: string;
    modelId?: string;
    stability?: number;
    similarity?: number;
    style?: number;
    speakerBoost?: boolean;
    outputFormat?: 'mp3_22050_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
}

/**
 * Voice filters for API calls
 */
export interface VoiceFilters {
    language?: string;
    gender?: string;
    accent?: string;
    age?: string;
    useCase?: string;
}

/**
 * Language dropdown option
 */
export interface LanguageDropdownOption {
    value: string;
    label: string;
    voiceCount: number;
    displayName: string;
}

/**
 * Voice pricing tier enum
 */
export enum VoicePricingTier {
    STANDARD = 'standard',
    PREMIUM = 'premium'
}

/**
 * Voice category enum
 */
export enum VoiceCategory {
    PREMADE = 'premade',
    CLONED = 'cloned',
    GENERATED = 'generated',
    PROFESSIONAL = 'professional'
}

/**
 * Output format enum
 */
export enum AudioOutputFormat {
    MP3_22050_32 = 'mp3_22050_32',
    MP3_44100_64 = 'mp3_44100_64',
    MP3_44100_96 = 'mp3_44100_96',
    MP3_44100_128 = 'mp3_44100_128',
    MP3_44100_192 = 'mp3_44100_192',
    PCM_16000 = 'pcm_16000',
    PCM_22050 = 'pcm_22050',
    PCM_24000 = 'pcm_24000',
    PCM_44100 = 'pcm_44100',
    ULAW_8000 = 'ulaw_8000'
}

/**
 * ElevenLabs API error response
 */
export interface ElevenLabsError {
    detail: {
        status: string;
        message: string;
    };
}

/**
 * Subscription tier info
 */
export interface SubscriptionInfo {
    tier: string;
    character_count: number;
    character_limit: number;
    can_extend_character_limit: boolean;
    allowed_to_extend_character_limit: boolean;
    next_character_count_reset_unix: number;
    voice_limit: number;
    professional_voice_limit: number;
    can_extend_voice_limit: boolean;
    can_use_instant_voice_cloning: boolean;
    can_use_professional_voice_cloning: boolean;
    currency: string;
    status: string;
}

/**
 * User info from ElevenLabs
 */
export interface ElevenLabsUser {
    subscription: SubscriptionInfo;
    is_new_user: boolean;
    xi_api_key: string;
    can_use_delayed_payment_methods: boolean;
}