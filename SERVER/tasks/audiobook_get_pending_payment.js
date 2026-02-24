const author = require('../models/author');

async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        const Author = require('../models/author');
        const author = await Author.findOne({
            userId,
            enabled: true
        })
        if (!author) {
            return res.status(200).json({
                success: false,
                message: 'Invalid author'
            })
        }

        const Audiobook = require('../models/audiobook');
        const audiobooks = await Audiobook.find({
            authorId: author._id,
            totalPrice: { $gt: 0 },
            published: false,
            enabled: true
        })

        return res.status(200).json({
            success: true,
            audiobooks
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
