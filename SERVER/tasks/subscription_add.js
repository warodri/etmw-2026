const Subscription = require('../models/subscription');

/**
 * IMPORTANT: DO NOT CALL THIS FROM THE CLIENT.
 * CALL THIS AFTER THE PAYMENT IS CORRECT FROM STRIPE.
 */
async function run(data, req, res) {
    try {
        const {
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

        const now = Date.now();
        const subscription = new Subscription({
            userId,
            plan,
            booksPerMonth,
            periodStart,
            periodEnd,
            status,
            region,
            currency,
            price,
            provider: provider || 'stripe',
            createdAt: now,
            updatedAt: now
        });

        await subscription.save();

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