const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            targetId,
            targetIds,
            targetType
        } = data;

        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = {
            userId,
            enabled: true
        };
        if (targetType) {
            query.targetType = targetType;
        }
        if (Array.isArray(targetIds) && targetIds.length > 0) {
            query.targetId = { $in: targetIds };
        } else if (targetId) {
            query.targetId = targetId;
        }

        //  Get my reactions with optional filters
        const reactions = await Reaction.find(query);

        //  If targetId is sent, then check if I'm reacting to this one
        let reactionTotargetId = null;
        if (targetId) {
            reactionTotargetId = await Reaction.findOne({
                userId,
                targetId,
                ...(targetType ? { targetType } : {}),
                enabled: true
            })
        }

        return res.status(200).json({
            success: true,
            reactions,
            reactionTotargetId
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
