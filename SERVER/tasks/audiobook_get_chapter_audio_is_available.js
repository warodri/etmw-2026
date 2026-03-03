const { getChapterAvailabilityDecision } = require('../workers/subscription');

/**
 * THIS IS FOR USERS ONLY
 * USERS ASK FOR AN AUDIO. WE RUN ALL THE VALIDATIONS.
 */
async function run(data, req, res) {
    try {
        const {
            audiobookId,
            chapterNumber,
            grantAccess,
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
        const decision = await getChapterAvailabilityDecision(userId, audiobookId, number, {
            grantIfPossible: grantAccess !== false
        });
        if (!decision.isAvailable) {
            return res.status(200).json({
                success: false,
                isAvailable: false,
                reasonCode: decision.reasonCode,
                message: decision.message || 'Chapter not available'
            })
        }

        return res.status(200).json({
            success: true,
            isAvailable: true,
            reasonCode: decision.reasonCode,
            message: decision.message || 'Available'
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
