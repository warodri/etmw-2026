async function run(data, req, res) {
    try {
        const {
            recordId,

            storyId,
            chapterNumber,
            memory
        } = data;
        
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const YourStoryChapterMemory = require('../models/your_story_chapter_memory');
        const existing = await YourStoryChapterMemory.findOne({
            _id: recordId,
            storyId,
            enabled: true
        })
        if (existing) {
            //  UPDATE
            existing.chapterNumber = chapterNumber;
            existing.memory = memory;
            await existing.save();
            //  Respond
            return res.status(200).json({
                success: true,
            })
        }
        else {
            //  ADD NEW
            const doc = new YourStoryChapterMemory();
            doc.storyId = storyId;
            doc.chapterNumber = chapterNumber;
            doc.memory = memory;
            const memory = await doc.save();
            //  Respond
            return res.status(200).json({
                success: true,
                memory
            })
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