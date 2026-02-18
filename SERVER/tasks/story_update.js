
async function run(data, req, res) {
    try {
        const payloadWrapper = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
        const {
            _id,
            payload
        } = payloadWrapper;

        if (!_id || !payload) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Find story
        const Story = require('../models/story');
        const story = await Story.findOne({
            _id,
            enabled: true
        })

        if (!story) {
            return res.status(200).json({
                success: false,
                message: 'Story not found'
            })
        }

        const allowed = [
            'title',
            'subtitle',
            'quote',
            'image',
            'author',
            'language',
            'chapterNumber',
            'totalChapters',
            'slideIndex',
            'chapterPieces'
        ];

        allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                story[key] = payload[key];
            }
        });

        story.updatedAt = Date.now();
        await story.save();

        return res.status(200).json({
            success: true,
            story
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
