const Author = require('../models/author');

async function run(data, req, res) {
    try {
        const {
            penName,
            country,
            language,
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
        if (penName) query.penName = { $regex: penName, $options: 'i' };
        if (country) query.country = country;
        if (language) query.languages = language;
        if (enabled !== undefined) query.enabled = enabled;

        const authors = await Author.find(query)
            .populate('userId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Author.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: authors,
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