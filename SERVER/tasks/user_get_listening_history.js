const User = require('../models/user');

async function run(data, req, res) {
    try {
        const {
            audiobookId
        } = data;

        //  Validate user
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        //  Get user listening history
        const ListeningProgress = require('../models/listening_progress');
        const history = await ListeningProgress.find({
            userId,
            audiobookId,
            enabled: true
        })

        return res.status(200).json({
            success: true,
            history,
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