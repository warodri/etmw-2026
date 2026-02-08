
async function run(data, req, res) {
    try {
        const {
            audiobookId,
        } = data;

        const userId = req.userId || null;

        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const AudioBook = require('../models/audiobook');
        const doc = await AudioBook.findOne({
            _id: audiobookId,
            enabled: true
        })
        if (doc && doc.paymentCompleted) {
            res.json({
                success: true,
                paymentCompleted: true
            });
        } else {
            res.json({
                success: false,
            });
        }

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