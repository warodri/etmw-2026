/*
node /Users/warodriguez/Downloads/WALTER/ETMW-2026/VOICE-TEST/convert_with_eleven.js \
  /Users/warodriguez/Downloads/WALTER/ETMW-2026/VOICE-TEST/convert-to-audio.pdf \
  851ejYcv2BoNPjrkw93G \
  test-spanish.mp3 \
  eleven_turbo_v2 \
  es-AR
*/
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { promisify } = require('util');
const { execFile } = require('child_process');
const { PDFParse } = require('pdf-parse');
const elevenLabsUtils = require('../SERVER/workers/eleven_labs_utils');
const execFileAsync = promisify(execFile);

function isLikelyBinary(buffer) {
    if (!buffer || buffer.length === 0) return false;
    let suspicious = 0;
    const sampleSize = Math.min(buffer.length, 4096);
    for (let i = 0; i < sampleSize; i += 1) {
        const byte = buffer[i];
        const isAllowed =
            byte === 9 || // tab
            byte === 10 || // lf
            byte === 13 || // cr
            (byte >= 32 && byte <= 126) || // printable ASCII
            byte >= 128; // UTF-8 bytes
        if (!isAllowed) suspicious += 1;
    }
    return suspicious / sampleSize > 0.1;
}

async function textFromInputFile(inputPath, inputBuffer) {
    const ext = path.extname(inputPath).toLowerCase();
    const inputText = inputBuffer.toString('utf8');

    if (ext === '.txt' || ext === '.md' || ext === '.srt') {
        return inputText.trim();
    }

    if (ext === '.pdf') {
        const parser = new PDFParse({ data: inputBuffer });
        let parsed;
        try {
            parsed = await parser.getText();
        } finally {
            await parser.destroy().catch(() => {});
        }
        const recoveredText = (parsed?.text || '').trim();
        if (!recoveredText) {
            return '';
        }
        console.log('----- PDF TEXT START -----');
        console.log(recoveredText);
        console.log('----- PDF TEXT END -----');
        return recoveredText;
    }

    if (isLikelyBinary(inputBuffer)) {
        throw new Error(
            `Input looks binary (${path.basename(inputPath)}). ` +
            `Use a .pdf (preferred) or .txt with readable text.`
        );
    }

    return inputText.trim();
}

function splitTextIntoChunks(text, maxChars = 28000) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return [];
    }

    if (normalized.length <= maxChars) {
        return [normalized];
    }

    const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
    const chunks = [];
    let current = '';

    for (const sentenceRaw of sentences) {
        const sentence = sentenceRaw.trim();
        if (!sentence) continue;

        if (sentence.length > maxChars) {
            // Hard-split extremely long sentence
            if (current) {
                chunks.push(current.trim());
                current = '';
            }
            for (let i = 0; i < sentence.length; i += maxChars) {
                chunks.push(sentence.slice(i, i + maxChars).trim());
            }
            continue;
        }

        const candidate = current ? `${current} ${sentence}` : sentence;
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            chunks.push(current.trim());
            current = sentence;
        }
    }

    if (current) {
        chunks.push(current.trim());
    }

    return chunks;
}

async function concatMp3Files(inputFiles, outputFile) {
    const listFile = path.join(os.tmpdir(), `ffmpeg_concat_${Date.now()}.txt`);
    const content = inputFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n');
    await fs.writeFile(listFile, content, 'utf8');

    try {
        await execFileAsync('ffmpeg', [
            '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', listFile,
            '-c', 'copy',
            outputFile
        ]);
    } finally {
        await fs.unlink(listFile).catch(() => {});
    }
}

async function convertPdfToAudioWithElevenLabs() {
    const inputPath = process.argv[2] || path.join(__dirname, 'english.pdf');
    const voiceId = process.argv[3] || '851ejYcv2BoNPjrkw93G';
    const outputName = process.argv[4] || `eleven_test_${Date.now()}.mp3`;
    const modelId = process.argv[5] || 'eleven_turbo_v2';
    const targetLanguage = process.argv[6] || 'es';

    const inputBuffer = await fs.readFile(inputPath);
    const text = await textFromInputFile(inputPath, inputBuffer);

    if (!text) {
        throw new Error(`No text found in input: ${inputPath}`);
    }

    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const chunks = splitTextIntoChunks(text, 28000);
    const chunkDir = path.join(outputDir, `parts_${Date.now()}`);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkFiles = [];
    for (let i = 0; i < chunks.length; i += 1) {
        const chunkText = chunks[i];
        const params = {
            voiceId,
            text: chunkText,
            modelId,
            targetLanguage,
            stability: 0.5,
            similarity: 0.75,
            style: 0.2,
            speakerBoost: true,
            outputFormat: 'mp3_44100_128'
        };
        const audioBuffer = await elevenLabsUtils.textToSpeech(params);
        const chunkFile = path.join(chunkDir, `part_${String(i + 1).padStart(3, '0')}.mp3`);
        await fs.writeFile(chunkFile, audioBuffer);
        chunkFiles.push(chunkFile);
        console.log(`Generated chunk ${i + 1}/${chunks.length} (${chunkText.length} chars)`);
    }

    const outputPath = path.join(outputDir, outputName);
    if (chunkFiles.length === 1) {
        await fs.copyFile(chunkFiles[0], outputPath);
    } else {
        await concatMp3Files(chunkFiles, outputPath);
    }

    console.log('Done.');
    console.log(`Input: ${inputPath}`);
    console.log(`Voice: ${voiceId}`);
    console.log(`Model: ${modelId}`);
    console.log(`Target language: ${targetLanguage}`);
    console.log(`Chars: ${text.length}`);
    console.log(`Chunks: ${chunks.length}`);
    console.log(`Parts: ${chunkDir}`);
    console.log(`Output: ${outputPath}`);
}

convertPdfToAudioWithElevenLabs().catch((error) => {
    console.error('Conversion failed:', error.message);
    process.exit(1);
});
