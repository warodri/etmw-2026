const Subscription = require('../models/subscription');

async function run(data, req, res) {
    try {
        const {
            plan,
            status,
            region,
            provider,
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
        if (plan) query.plan = plan;
        if (status) query.status = status;
        if (region) query.region = region;
        if (provider) query.provider = provider;

        const subscriptions = await Subscription.find(query)
            .populate('userId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Subscription.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: subscriptions,
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