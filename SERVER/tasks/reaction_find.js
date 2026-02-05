const Reaction = require('../models/reaction');

async function run(data, req, res) {
    try {
        const {
            targetId,
            targetType,
            reaction,
            limit = 50,
            skip = 0
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = {};
        if (targetId) query.targetId = targetId;
        if (targetType) query.targetType = targetType;
        if (reaction) query.reaction = reaction;

        const reactions = await Reaction.find(query)
            .populate('userId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Reaction.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: reactions,
            total
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