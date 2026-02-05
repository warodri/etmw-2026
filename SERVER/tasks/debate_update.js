const Debate = require('../models/debate');

async function run(data, req, res) {
    try {
        const {
            id,
            totalMessages,
            enabled
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (totalMessages !== undefined) updateData.totalMessages = totalMessages;
        if (enabled !== undefined) updateData.enabled = enabled;

        const debate = await Debate.findByIdAndUpdate(id, updateData, { new: true });

        if (!debate) {
            return res.status(200).json({
                success: false,
                message: 'Debate not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: debate
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