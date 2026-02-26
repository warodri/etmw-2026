async function run(data, req, res) {
    try {
        const {
            recordId,

            storyId,
            chapterNumber,
            title,
            summary,
            content,
            characterProgression,
            hooksForNextChapter,
            wordCount,
            aiModelUsed,
        } = data;
        
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const YourStoryChapter = require('../models/your_story_chapter');
        const existing = await YourStoryChapter.findOne({
            _id: recordId,
            storyId,
            enabled: true
        })
        if (existing) {
            //  UPDATE
            existing.chapterNumber = chapterNumber;
            existing.title = title;
            existing.summary = summary;
            existing.content = content;
            existing.characterProgression = characterProgression;
            existing.hooksForNextChapter = hooksForNextChapter;
            existing.wordCount = wordCount;
            existing.aiModelUsed = aiModelUsed;
            await existing.save();
            //  Respond
            return res.status(200).json({
                success: true,
            })
        }
        else {
            //  ADD NEW
            const doc = new YourStoryChapter();
            doc.storyId = storyId;
            doc.chapterNumber = chapterNumber;
            doc.title = title;
            doc.summary = summary;
            doc.content = content;
            doc.characterProgression = characterProgression;
            doc.hooksForNextChapter = hooksForNextChapter;
            doc.wordCount = wordCount;
            doc.aiModelUsed = aiModelUsed;
            const chapter = await doc.save();
            //  Respond
            return res.status(200).json({
                success: true,
                chapter
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