const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType,
            reaction
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const reactionDoc = new Reaction({
            userId,
            targetId,
            targetType,
            reaction,
            createdAt: Date.now()
        });

        await reactionDoc.save();

        return res.status(200).json({
            success: true,
            data: reactionDoc
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