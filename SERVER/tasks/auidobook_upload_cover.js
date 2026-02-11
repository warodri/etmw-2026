const { informAdmins } = require('../workers/email');

async function run(data, req, res) {
    try {
        const {
            audiobookId
        } = req.body;

        const file = req.file || null;
        const userId = req.userId || null;

        if (!userId || !file || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Find the author
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

        //  Find the book
        const AudioBook = require('../models/audiobook');
        const doc = await AudioBook.findOne({
            _id: audiobookId,
            authorId: author._id,
            enabled: true
        })
        if (!doc) {
            return res.status(200).json({
                success: false,
                message: 'Invalid audiobook'
            })
        }
        doc.coverFile = file.filename;
        doc.coverFileMimetype = file.mimetype;
        await doc.save();

        //  Respond
        return res.status(200).json({
            success: true,
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