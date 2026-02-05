const Audiobook = require('../models/audiobook');

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

        const audiobook = await Audiobook.findById(id)
            .populate('authorId')
            .populate('categories');

        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Audiobook not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: audiobook
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