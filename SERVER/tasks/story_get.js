
async function run(data, req, res) {
    try {
        const {
            skip,
            limit
        } = data;

        //  Find stories
        const Audiobook = require('../models/audiobook');
        const Story = require('../models/story');
        const stories = await Story.find({
            enabled: true
        }).skip( skip ).limit( limit )

        //  Replace the first image with the image of the book
        for (let item of stories) {
            const audiobookId = item.audiobookId;
            if (audiobookId) {
                const a = await Audiobook.findOne({
                    _id: audiobookId,
                    enabled: true
                })
                if (a) {
                    item.image = a.coverFile;
                    item.title = a.title;
                }
            }
        }

        return res.status(200).json({
            success: true,
            stories
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