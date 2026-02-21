const Author = require('../models/author');

async function run(data, req, res) {
    try {
        const {
            id,
            penName,
            bio,
            languages,
            country,
            enabled
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (penName !== undefined) updateData.penName = penName;
        if (bio !== undefined) updateData.bio = bio;
        if (languages !== undefined) updateData.languages = languages;
        if (country !== undefined) updateData.country = country;
        if (enabled !== undefined) updateData.enabled = enabled;

        const author = await Author.findByIdAndUpdate(id, updateData, { new: true });

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