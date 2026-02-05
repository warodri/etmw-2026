const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            id,
            reaction
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = {};
        if (reaction !== undefined) updateData.reaction = reaction;

        const reactionDoc = await Reaction.findByIdAndUpdate(id, updateData, { new: true });

        if (!reactionDoc) {
            return res.status(200).json({
                success: false,
                message: 'Reaction not found'
            })
        }

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