/**
 * THIS IS FOR ADMIN USERS ONLY
 * ADMIN USERS CAN ASK FOR ANY AUDIO IF THEY SEND THE PASSWORD.
 */
async function run(data, req, res) {
    try {
        const {
            audiobookId,
            chapterNumber,
            password
        } = data;

        //  Validate input
        if (!audiobookId || !chapterNumber || chapterNumber <= 0) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Validate password
        if (!password || password != 'car0lina') {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        //  Get the audiobook
        const AudioBook = require('../models/audiobook');        
        const audiobook = await AudioBook.findOne({ 
            _id: audiobookId,
            enabled: true 
        })

        //  Validate audiobook
        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Invalid Audiobook'
            })
        } else {

            //  Chapters
            /* [{
                chapter: Number,
                url: String,
                durationSec: Number
            }] */
            const selectedChapter = audiobook.audioFiles.find((i) => i.chapter == chapterNumber);
            if (!selectedChapter || !selectedChapter.url) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid chapter'
                })
            }

            // Construct the file path
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '..', selectedChapter.url);
            const contentType = getAudioContentType(filePath);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return res.status(200).json({
                    success: false,
                    message: 'Audio file not found'
                })
            }

            // Get file stats for Content-Length
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                // Handle range requests (seeking in audio)
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(filePath, { start, end });
                
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                };
                
                res.writeHead(206, head);
                file.pipe(res);
                
            } else {
                // Stream entire file
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes'
                };
                
                res.writeHead(200, head);
                fs.createReadStream(filePath).pipe(res);
            }
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

function getAudioContentType(filePath) {
    const path = require('path');
    const ext = String(path.extname(filePath || '')).toLowerCase();
    if (ext === '.wav') return 'audio/wav';
    if (ext === '.mp3') return 'audio/mpeg';
    if (ext === '.ogg') return 'audio/ogg';
    if (ext === '.m4a') return 'audio/mp4';
    return 'application/octet-stream';
}

module.exports = {
    run
}
