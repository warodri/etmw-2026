const Subscription = require('../models/subscription');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const subscription = await Subscription.findById(id).populate('userId');

        if (!subscription) {
            return res.status(200).json({
                success: false,
                message: 'Subscription not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: subscription
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