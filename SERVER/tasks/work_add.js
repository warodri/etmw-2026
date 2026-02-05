const Audiobook = require('../models/audiobook');

async function run(data, req, res) {
    try {
        const {
            authorId,
            title,
            description,
            language,
            accent,
            categories,
            sourceType
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const now = Date.now();
        const audiobook = new Audiobook({
            authorId,
            title,
            description,
            language,
            accent,
            categories,
            sourceType,
            pipelineStatus: 'uploaded',
            published: false,
            createdAt: now,
            updatedAt: now
        });

        await audiobook.save();

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