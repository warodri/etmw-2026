async function run(data, req, res) {
    try {
        const {
            audiobookId
        } = data;

        const userId = req.userId || null;
        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const Audiobook = require('../models/audiobook');
        const audiobook = await Audiobook.findOne({
            _id: audiobookId,
            userId,
            enabled: true
        })

        if (audiobook) {
            audiobook.enabled = false;
            audiobook.updatedAt = Date.now();
            await audiobook.save();
        }

        return res.status(200).json({
            success: true
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
