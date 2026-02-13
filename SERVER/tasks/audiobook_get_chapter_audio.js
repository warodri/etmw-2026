/**
 * THIS IS FOR USERS ONLY
 * USERS ASK FOR AN AUDIO. WE RUN ALL THE VALIDATIONS.
 */
async function run(data, req, res) {
    try {
        const {
            audiobookId,
            chapterNumber,
        } = data;

        const userId = req.userId || null;

        //  Validate input
        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Get the audiobook
        const AudioBook = require('../models/audiobook');        
        const audiobook = await AudioBook.findOne({ 
            _id: audiobookId,
            published: true,
            pipelineStatus: 'published',
            enabled: true 
        })
        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Invalid Audiobook'
            })
        } 

        //  IS THIS AUDIOBOOK AVAILABE FOR THIS USER?
        // const AudioBooksAvailable = require('../models/user_audiobooks_available');        
        // const available = await AudioBooksAvailable.findOne({
        //     userId,
        //     audiobookId,
        //     enabled: true
        // })
        // if (!available) {
        //     return res.status(200).json({
        //         success: false,
        //         message: 'Audiobook not available for your account'
        //     })
        // }

        //  What chapter to search?
        const number = chapterNumber && chapterNumber > 0 ? chapterNumber : 1;

        //  IS THIS CHAPTER AVAILABLE FOR THE USER?
        // const AudioBooksChapterAvailable = require('../models/user_chapter_available');        
        // const chapterAvailable = await AudioBooksChapterAvailable.findOne({
        //     userId,
        //     audiobookId,
        //     chapterNumber: number,
        //     enabled: true
        // })
        // if (!chapterAvailable) {
        //     return res.status(200).json({
        //         success: false,
        //         message: 'Chapter not available for your account'
        //     })
        // } 

        /*  Chapters: [{
                chapter: Number,
                url: String,
                durationSec: Number
            }] 
        */
        const selectedChapter = audiobook.audioFiles.find((i) => i.chapter == number);
        if (!selectedChapter || !selectedChapter.url) {
            return res.status(200).json({
                success: false,
                message: 'Invalid chapter'
            })
        }

        const AudiobookChapterLog = require('../models/audiobook_chapter_log');

        //  Log access to this Audiobook by the user
        const AudiobookUserLog = require('../models/audiobook_user_log');
        let log = await AudiobookUserLog.findOne({
            userId,
            audiobookId,
            enabled: true
        })
        if (!log) {
            //  Add new log
            const doc = new AudiobookChapterLog();
            doc.userId = userId;
            doc.audiobookId = audiobookId;
            doc.chapterNumber = number;
            await doc.save();
        } else {
            log.updatedAt = Date.now();
            await doc.save();
        }

        //  Log the access to this chapter by the user
        log = await AudiobookChapterLog.findOne({
            userId,
            audiobookId,
            audioUrl: selectedChapter.url,
            enabled: true
        })
        if (!log) {
            //  Add new log
            const doc = new AudiobookChapterLog();
            doc.userId = userId;
            doc.audiobookId = audiobookId;
            doc.chapterNumber = number;
            await doc.save();
        } else {
            log.updatedAt = Date.now();
            await doc.save();
        }
        
        // Construct the file path
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', selectedChapter.url);
        
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
                'Content-Type': 'audio/mpeg',
            };
            
            res.writeHead(206, head);
            file.pipe(res);

        } else {

            // Stream entire file
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
                'Accept-Ranges': 'bytes'
            };
            
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
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