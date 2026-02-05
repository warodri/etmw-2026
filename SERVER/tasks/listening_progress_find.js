const ListeningProgress = require('../models/listening_progress');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            completed,
            limit = 50,
            skip = 0
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = { userId };
        if (audiobookId) query.audiobookId = audiobookId;
        if (completed !== undefined) query.completed = completed;

        const progress = await ListeningProgress.find(query)
            .populate('audiobookId')
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await ListeningProgress.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: progress,
            total
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
