const Author = require('../models/author');

async function run(data, req, res) {
    try {
        const {
            penName,
            bio,
            languages,
            country
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const now = Date.now();
        const author = new Author({
            userId,
            penName,
            bio,
            languages,
            country,
            enabled: true,
            createdAt: now,
            updatedAt: now
        });

        await author.save();

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