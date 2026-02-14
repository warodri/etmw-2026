const Subscription = require('../models/subscription');

async function run(data, req, res) {
    try {
        const {
        } = data;

        //  Vaildate user
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        //  Find this user's subcription
        const subscription = await Subscription.findOne({
            userId,
            enabled: true
        }).populate('userId');
        if (!subscription) {
            return res.status(200).json({
                success: false,
                message: 'Subscription not found'
            })
        }
        
        //  Return
        return res.status(200).json({
            success: true,
            subscription
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