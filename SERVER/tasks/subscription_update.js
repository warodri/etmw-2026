const User = require('../models/user');
const Subscription = require('../models/subscription');
const SubscriptionHisstory = require('../models/subscription_history');
const { informAdmins } = require('../workers/email');

/**
 * IMPORTANT: DO NOT CALL THIS FROM THE CLIENT.
 * CALL FROM THIS SERVER.
 */
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

        //  User is mandatory
        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        //  Get the user
        const user = await User.findOne({
            _id: userId,
            enabled: true
        })
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'invalid user'
            })
        }

        //  Get current user subscription
        const currentSub = await Subscription.findOne({
            userId,
            enabled: true
        })
        if (!currentSub) {
            return res.status(200).json({
                success: false,
                message: 'invalid subscription'
            })
        }

        //  Add a record to the subscription history
        const subHistory = new SubscriptionHisstory();
        subHistory.userId = userId;
        subHistory.subscription = currentSub;
        await subHistory.save();

        //  Now move this user to the new subscription
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

        //  Do the update
        const subscription = await Subscription.findByIdAndUpdate(id, updateData, { new: true });
        if (!subscription) {
            return res.status(200).json({
                success: false,
                message: 'Subscription not found'
            })
        }

        //  Tell the Admins a user changed subscription
        const SUBJECT = 'ETMW - Un usuario ha cambiado su subcripcion!'
        const BODY = `
            ID: ${user._id } <br />
            Nombre: ${user.firstName } ${user.lastName } <br />
            <HR />
            Vieja Subscription: ${ subscription.plan } <br />
            NUEVA SUBSCRIPCION: ${ plan } <br />
        `
        informAdmins(SUBJECT, BODY)

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