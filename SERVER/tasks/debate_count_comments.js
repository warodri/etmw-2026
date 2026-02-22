async function run(data, req, res) {
    try {
        const {
            audiobookId,
        } = data;

        if (!audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const DebateComments = require('../models/debate_comment');
        const totalComments = await DebateComments.countDocuments({
            audiobookId,
            enabled: true
        })
        
        return res.status(200).json({
            success: true,
            totalComments
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