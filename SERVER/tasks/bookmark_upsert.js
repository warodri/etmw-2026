
async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType
        } = data;
        
        const userId = req.userId || null;

        if (!userId || !targetId || !targetType) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const Bookmark = require('../models/bookmark');

        const item = await Bookmark.findOne({
            userId,
            targetId,
            targetType,
            enabled: true
        });

        if (item) {
            //  Remove
            await Bookmark.deleteOne({
                userId,
                targetId,
                targetType,
                enabled: true
            });
        } else {
            // Add
            const doc = new Bookmark();
            doc.userId = userId;
            doc.targetId = targetId;
            doc.targetType = targetType;
            await doc.save();
        }
        
        return res.status(200).json({
            success: true,
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