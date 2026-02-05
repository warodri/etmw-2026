const Debate = require('../models/debate');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            authorId,
            enabled,
            limit = 50,
            skip = 0
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = {};
        if (audiobookId) query.audiobookId = audiobookId;
        if (authorId) query.authorId = authorId;
        if (enabled !== undefined) query.enabled = enabled;

        const debates = await Debate.find(query)
            .populate('audiobookId')
            .populate('authorId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Debate.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: debates,
            total
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