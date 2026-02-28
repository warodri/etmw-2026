async function run(data, req, res) {
    try {
        const {
            storyId
        } = data;

        const userId = req.userId || null;
        if (!userId || !storyId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const YourStory = require('../models/your_story');
        const YourStoryChapter = require('../models/your_story_chapter');

        const story = await YourStory.findOne({
            _id: storyId,
            userId,
            enabled: true,
        });

        if (!story) {
            return res.status(200).json({
                success: false,
                message: 'Invalid story'
            });
        }

        const chapters = await YourStoryChapter.find({
            storyId: story._id,
            enabled: true,
        }).sort({ chapterNumber: 1 });

        return res.status(200).json({
            success: true,
            chapters,
        });

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        return res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

module.exports = {
    run
};
