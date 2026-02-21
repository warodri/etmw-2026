async function run(data, req, res) {
    try {
        const {
            audiobookId,
            chapterNumber,
            progressPercent,
            completed
        } = data;

        //  Validate user
        const userId = req.userId || null;
        if (!userId || !audiobookId || !chapterNumber) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        //  Upsert user listening history (one record per user/book/chapter)
        const ListeningProgress = require('../models/listening_progress');
        const now = Date.now();
        await ListeningProgress.findOneAndUpdate(
            {
                userId,
                audiobookId,
                chapterNumber,
                enabled: true
            },
            {
                $set: {
                    progressPercent,
                    completed,
                    updatedAt: now
                },
                $setOnInsert: {
                    userId,
                    audiobookId,
                    chapterNumber,
                    enabled: true,
                    createdAt: now
                }
            },
            {
                upsert: true,
                new: true
            }
        );

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
