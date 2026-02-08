const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            params,
        } = req.body;

        if (!audiobookId || !params) {
            return res.json({ 
                success: false, 
                message: 'Missing parameters' 
            });
        }

        const AudioBook = require('../models/audiobook');
        
        const audiobook = await AudioBook.findOne({ 
            _id: audiobookId,
            enabled: true 
        })

        if (!audiobook) {
            //  Respond
            return res.status(200).json({
                success: false,
            })
        } else {

            //  Convert
            const elevenLabsUtils = require('../workers/eleven_labs_utils');
            const audioBuffer = await elevenLabsUtils.textToSpeech(params)

            // Create directory for audiobook if it doesn't exist
            const audiobookDir = path.join(__dirname, '../audiobooks', audiobookId);
            await fs.mkdir(audiobookDir, { recursive: true });

            // Generate filename
            const filename = `chapter_${params.chapterNumber}_${Date.now()}.mp3`;
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
            const existingChapterIndex = audiobook.audioFiles.findIndex(
                file => file.chapter === params.chapterNumber
            );

            if (existingChapterIndex >= 0) {
                // Update existing chapter
                audiobook.audioFiles[existingChapterIndex] = {
                    chapter: params.chapterNumber,
                    url: relativeUrl,
                    durationSec: durationSec
                };
            } else {
                // Add new chapter
                audiobook.audioFiles.push({
                    chapter: params.chapterNumber,
                    url: relativeUrl,
                    durationSec: durationSec
                });
            }

            // Sort chapters by chapter number
            audiobook.audioFiles.sort((a, b) => a.chapter - b.chapter);

            // Calculate total duration
            audiobook.totalAudioDurationSec = audiobook.audioFiles.reduce(
                (sum, file) => sum + (file.durationSec || 0), 
                0
            );

            // Update pipeline status
            if (audiobook.pipelineStatus === 'uploaded') {
                audiobook.pipelineStatus = 'tts_processing';
            }

            audiobook.updatedAt = Date.now();
            await audiobook.save();

            res.json({
                success: true,
                message: 'Conversion successful',
                chapter: {
                    chapter: params.chapterNumber,
                    url: relativeUrl,
                    durationSec: durationSec
                }
            });

        }

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

module.exports = {
    run
}