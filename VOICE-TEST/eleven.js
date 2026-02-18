import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
const elevenlabs = new ElevenLabsClient({
    apiKey: "sk_a4faad23980d64c602d81031493caf8cde5df39c48a56efe", // Defaults to process.env.ELEVENLABS_API_KEY
});

async function listVoices() {
    const voices = await elevenlabs.voices.search({
        search: 'kafka'
    });
    console.log('voices', voices)
}

async function tts() {
    const audio = await elevenlabs.textToSpeech.convert("Xb7hH8MSUJpSbSDYk0k2", {
        text: "Hello! 你好! Hola! नमस्ते! Bonjour! こんにちは! مرحبا! 안녕하세요! Ciao! Cześć! Привіт! வணக்கம்!",
        modelId: "eleven_multilingual_v2",
    });
    console.log(audio)
}

//  Get Spanish voices with specific filters
curl -X GET "https://api.elevenlabs.io/v1/shared-voices?language=es&page_size=30&category=high_quality" \
  -H "xi-api-key: sk_a4faad23980d64c602d81031493caf8cde5df39c48a56efe"