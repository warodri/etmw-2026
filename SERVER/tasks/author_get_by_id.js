const Author = require('../models/author');

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

        const author = await Author.findById(id).populate('userId');

        if (!author) {
            return res.status(200).json({
                success: false,
                message: 'Author not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: author
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