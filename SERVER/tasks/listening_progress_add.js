const ListeningProgress = require('../models/listening_progress');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            progressPercent,
            completed
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const progress = new ListeningProgress({
            userId,
            audiobookId,
            progressPercent: progressPercent || 0,
            completed: completed || false,
            updatedAt: Date.now()
        });

        await progress.save();

        return res.status(200).json({
            success: true,
            data: progress
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