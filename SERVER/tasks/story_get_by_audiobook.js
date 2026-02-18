
async function run(data, req, res) {
    try {
        const payload = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
        const {
            audiobookId,
            skip = 0,
            limit = 50
        } = payload;

        if (!audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Find stories
        const Story = require('../models/story');
        const stories = await Story.find({
            audiobookId,
            enabled: true
        })
        .sort({ chapterNumber: 1 })
        .skip(Number(skip) || 0)
        .limit(Number(limit) || 50);

        /**
         * IMPORTANT
         * Yes, we are returning the chapter text. 
         * But for the audio part, the user needs to request
         * to the server and it will validate if the user is 
         * able to listen or not that audio.
         */
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
