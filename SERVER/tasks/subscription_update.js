const Subscription = require('../models/subscription');

async function run(data, req, res) {
    try {
        const {
            id,
            plan,
            booksPerMonth,
            periodStart,
            periodEnd,
            status,
            region,
            currency,
            price,
            provider
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (plan !== undefined) updateData.plan = plan;
        if (booksPerMonth !== undefined) updateData.booksPerMonth = booksPerMonth;
        if (periodStart !== undefined) updateData.periodStart = periodStart;
        if (periodEnd !== undefined) updateData.periodEnd = periodEnd;
        if (status !== undefined) updateData.status = status;
        if (region !== undefined) updateData.region = region;
        if (currency !== undefined) updateData.currency = currency;
        if (price !== undefined) updateData.price = price;
        if (provider !== undefined) updateData.provider = provider;

        const subscription = await Subscription.findByIdAndUpdate(id, updateData, { new: true });

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