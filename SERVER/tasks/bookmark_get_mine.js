
async function run(data, req, res) {
    try {
        const {
        } = data;
        
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const Bookmark = require('../models/bookmark');

        const bookmarks = await Bookmark.find({
            userId,
            enabled: true
        });
        
        return res.status(200).json({
            success: true,
            bookmarks
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