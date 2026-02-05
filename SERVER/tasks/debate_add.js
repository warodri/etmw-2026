const Debate = require('../models/debate');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            authorId
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const now = Date.now();
        const debate = new Debate({
            audiobookId,
            authorId,
            totalMessages: 0,
            enabled: true,
            createdAt: now,
            updatedAt: now
        });

        await debate.save();

        return res.status(200).json({
            success: true,
            data: debate
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