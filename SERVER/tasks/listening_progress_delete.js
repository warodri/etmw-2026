const ListeningProgress = require('../models/listening_progress');

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

        const progress = await ListeningProgress.findByIdAndDelete(id);

        if (!progress) {
            return res.status(200).json({
                success: false,
                message: 'Listening progress not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Listening progress deleted successfully'
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
