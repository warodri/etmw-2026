/**
 * STRIPE MUST SEND US THE PAYMENT CALLBACK HERE.
 * WE VALIDATE AND ADD THE SUBSCRIPTION ALONG WITH THE PAYMENT ID.
 * 
 */
async function handleStripeSuccess(req, res) {

    //  Get config
    const config = require('../config')
    const dev = config.STRIPE.test;        
    const stripe = require('stripe')( dev ? config.STRIPE.dev.secret_key : config.STRIPE.prod.secret_key );

    //  CLIENT
    const CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;
    
    try {
        const { session_id, user_id } = req.query;
        
        if (!session_id || !user_id) {
            return res.redirect(CLIENT + '/#/payment/cancelled');
        }
        
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {

            // Update audiobook record in database
            await updateSubscriptionPayment(user_id, {
                paymentCompleted: true,
                paymentId: session.payment_intent,
                paymentAmount: session.amount_total / 100,
                paymentDate: Date.now(),
                stripeSessionId: session_id,
            });

            // Redirect to success page
            res.redirect(CLIENT + '/#/payment/success');

        } else {

            //  Payment failed
            res.redirect(CLIENT + '/#/payment/failed');

        }

    } catch (error) {
        console.error('Error handling Stripe success:', error);
        res.redirect(CLIENT + '/#/payment/failed');
    }
}

async function updateSubscriptionPayment(userId, data) {
    const Subscription = require('../models/subscription');
    const doc = await Subscription.findOne({
        userId,
        enabled: true
    })
    if (doc) {
        //  Update status
        doc.status = 'active';
        //  Update with the payment info
        doc.paymentCompleted = data.paymentCompleted;
        doc.paymentId = data.paymentId;
        doc.paymentAmount = data.paymentAmount;
        doc.paymentDate = Date.now();
        doc.stripeSessionId = data.stripeSessionId;
        await doc.save();
    }
}


module.exports = {
    handleStripeSuccess
}
