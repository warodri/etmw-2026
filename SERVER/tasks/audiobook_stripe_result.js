/**
 * Stripe success callback - updates audiobook record with payment info
 * Called by Stripe after successful payment
 */
async function handleStripeSuccess(req, res) {

    //  Get config
    const config = require('../config')
    const dev = config.STRIPE.test;        
    const stripe = require('stripe')( dev ? config.STRIPE.dev.secret_key : config.STRIPE.prod.secret_key );

    //  CLIENT
    const CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;
    
    try {
        const { session_id, audiobook_id } = req.query;
        
        if (!session_id || !audiobook_id) {
            return res.redirect(CLIENT + '/#/payment/cancelled');
        }
        
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {

            // Update audiobook record in database
            await updateAudiobookPayment(audiobook_id, {
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

async function updateAudiobookPayment(audiobook_id, data) {
    const Audiobook = require('../models/audiobook');
    const doc = await Audiobook.findOne({
        _id: audiobook_id,
        enabled: true
    })
    if (doc) {
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
