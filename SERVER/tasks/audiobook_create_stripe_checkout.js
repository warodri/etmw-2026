const config = require('../config')

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            amount,
            currency
        } = data;

        const userId = req.userId || null;

        if (!userId || !audiobookId || !currency || !amount || amount <= 0) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        //  SERVER and CLIENT
        const SERVER = config.dev ? config.SERVER.local : config.SERVER.remote;
        const CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;

        //  Set Stripe
        const dev = config.dev;        
        const stripe = require('stripe')( dev ? config.STRIPE.dev.secret_key : config.STRIPE.prod.secret_key );

        let selectedCurrency = 'usd';
        if (currency == '£') {
            selectedCurrency = 'gbp'
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: selectedCurrency,
                        product_data: {
                            name: 'Audiobook Upload',
                            description: `Audiobook upload and conversion service`,
                        },
                        unit_amount: amount * 100, // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${SERVER}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}&audiobook_id=${audiobookId}`,
            cancel_url: `${CLIENT}/#/payment/cancel`,
            metadata: {
                audiobookId: audiobookId,
            },
        });

        res.json({
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id,
        });

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