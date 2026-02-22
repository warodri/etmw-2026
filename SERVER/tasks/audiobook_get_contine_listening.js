async function run(data, req, res) {
    try {
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        //  Get all user's listening progress
        const ListeningProgress = require('../models/listening_progress');
        const items = await ListeningProgress.find({
            userId,
            completed: false,
            enabled: true
        })
            .sort({ updatedAt: -1 })
            .limit(5);

        const listening = [];

        const Audiobook = require('../models/audiobook');
        for (let item of items) {
            const book = await Audiobook.findOne({
                _id: item.audiobookId,
                published: true,
                pipelineStatus: 'published',
                enabled: true
            })
            if (book) {
                listening.push({
                    _id: item._id,
                    chapterNumber: item.chapterNumber,
                    progressPercent: item.progressPercent,
                    book: {
                        _id: book._id,
                        title: book.title,
                        coverFile: book.coverFile,
                        authorName: book.authorName,
                    }
                })
            }
        }

        return res.status(200).json({
            success: true,
            listening
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
