const Debate = require('../models/debate');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const debate = await Debate.findById(id)
            .populate('audiobookId')
            .populate('authorId');

        if (!debate) {
            return res.status(200).json({
                success: false,
                message: 'Debate not found'
            })
        }

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