async function run(data, req, res) {
    try {
        const {
            skip,
            limit
        } = data;
        const safeSkip = Number.isFinite(Number(skip)) ? Math.max(0, Number(skip)) : 0;
        const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 20;
        
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const YourStory = require('../models/your_story');
        const stories = await YourStory.find({
            userId,
            enabled: true
        }).skip(safeSkip).limit(safeLimit).sort({ updatedAt: -1 })

        //  Respond
        return res.status(200).json({
            success: true,
            stories
        })

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
