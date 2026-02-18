const { isChapterAvailable, logAccessToChapter } = require('../workers/subscription');

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

        //  What chapter to search?
        const number = chapterNumber && chapterNumber > 0 ? chapterNumber : 1;

        //  Is chapter available for this user?
        const isAvailable = await isChapterAvailable(userId, audiobookId, number);
        if (!isAvailable) {
            return res.status(200).json({
                success: false,
                message: 'Chapter not available'
            })
        }

        return res.status(200).json({
            success: true,
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