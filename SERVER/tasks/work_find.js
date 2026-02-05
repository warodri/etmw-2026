const Audiobook = require('../models/audiobook');

async function run(data, req, res) {
    try {
        const {
            authorId,
            title,
            language,
            pipelineStatus,
            published,
            category,
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
        if (authorId) query.authorId = authorId;
        if (title) query.title = { $regex: title, $options: 'i' };
        if (language) query.language = language;
        if (pipelineStatus) query.pipelineStatus = pipelineStatus;
        if (published !== undefined) query.published = published;
        if (category) query.categories = category;

        const audiobooks = await Audiobook.find(query)
            .populate('authorId')
            .populate('categories')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Audiobook.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: audiobooks,
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