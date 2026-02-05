const ListeningProgress = require('../models/listening_progress');

async function run(data, req, res) {
    try {
        const {
            id,
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

        const updateData = { updatedAt: Date.now() };
        if (progressPercent !== undefined) updateData.progressPercent = progressPercent;
        if (completed !== undefined) updateData.completed = completed;

        const progress = await ListeningProgress.findByIdAndUpdate(id, updateData, { new: true });

        if (!progress) {
            return res.status(200).json({
                success: false,
                message: 'Listening progress not found'
            })
        }

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
