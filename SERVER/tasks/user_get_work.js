
async function run(data, req, res) {
    try {
        const {
            userId
        } = data;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
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

        const Audiobooks = require('../models/audiobook');
        const audiobooks = await Audiobooks.find({
            authorId: author._id,
            published: true,
            enabled: true,
        });

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