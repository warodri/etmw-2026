async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType,
            reaction
        } = data;

        const userId = req.userId || null;

        if (!userId || !targetId || !targetType || !reaction) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const Reaction = require('../models/reaction');
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(200).json({
                success: false,
                message: 'Invalid targetId'
            })
        }
        const objectId = new mongoose.Types.ObjectId(targetId);

        let r = await Reaction.findOne({
            userId,
            targetId: objectId,
            targetType,
            reaction,
            enabled: true
        })
        let reacted = false;
        if (r) {
            //  Remove reaction
            await Reaction.deleteOne({
                userId,
                targetId: objectId,
                targetType,
                reaction,
                enabled: true
            })
        } else {
            //  Add reaction
            const reactionDoc = new Reaction({
                userId,
                targetId: objectId,
                targetType,
                reaction,
            });    
            await reactionDoc.save();
            reacted = true;
        }

        const totalReactions = await Reaction.countDocuments({
            targetId: objectId,
            targetType,
            reaction,
            enabled: true
        });

        return res.status(200).json({
            success: true,
            reacted,
            totalReactions
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
