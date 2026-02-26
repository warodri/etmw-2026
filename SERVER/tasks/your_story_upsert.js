async function run(data, req, res) {
    try {
        const {
            recordId,
            authorId,
            isAIGenerated,
            status,
            blueprint,
            totalChaptersGenerated
        } = data;
        
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }
        if (!authorId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid authorId'
            })
        }

        const YourStory = require('../models/your_story');
        const existing = await YourStory.findOne({
            _id: recordId,
            userId,
            enabled: true
        })
        if (existing) {
            //  UPDATE
            existing.authorId = authorId;
            existing.isAIGenerated = isAIGenerated;
            existing.status = status;
            existing.blueprint = blueprint;
            existing.totalChaptersGenerated = totalChaptersGenerated;
            existing.updatedAt = Date.now();
            await existing.save();
            //  Respond
            return res.status(200).json({
                success: true,
            })
        }
        else {
            //  ADD NEW
            const doc = new YourStory();
            doc.userId = userId;
            doc.authorId = authorId;
            doc.isAIGenerated = isAIGenerated;
            doc.status = status;
            doc.blueprint = blueprint;
            doc.totalChaptersGenerated = totalChaptersGenerated;
            const story = await doc.save();
            //  Respond
            return res.status(200).json({
                success: true,
                story
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
