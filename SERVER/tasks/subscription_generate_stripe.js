/**
 * THIS FILE GENERATES A URL FOR STRIPE TO PAY.
 * ALSO STORES THE ACTION ON THE DATABASE SO THEN IT CAN CONFIRM THE PAYMENT.
 */

const config = require('../config')

async function run(data, req, res) {
    try {
        let {
            plan,
            region
        } = data;

        const userId = req.userId || null;
        if (!userId || !plan || !region) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        plan = plan.toString().toLowerCase();

        //  SERVER and CLIENT
        const SERVER = config.dev ? config.SERVER.local : config.SERVER.remote;
        const CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;

        //  Set Stripe
        const dev = config.dev;        
        const stripe = require('stripe')( dev ? config.STRIPE.dev.secret_key : config.STRIPE.prod.secret_key );

        //  Pick product from config
        const product = getProductByPlan(plan);
        if (!product || !product.productId) {
            return res.status(200).json({
                success: false,
                message: 'invalid product'
            })
        }

        //  Ensure subscription record exists and get its ID
        const subscriptionDoc = await upsertSubscriptionPayment(userId, plan, region, null, false);
        if (!subscriptionDoc) {
            return res.status(200).json({
                success: false,
                message: 'invalid subscription'
            })
        }

        //  Get first active price for the product
        const prices = await stripe.prices.list({
            product: product.productId,
            active: true,
            limit: 1
        });

        const price = prices && prices.data && prices.data.length > 0 ? prices.data[0] : null;
        if (!price) {
            return res.status(200).json({
                success: false,
                message: 'invalid price'
            })
        }

        // Create Stripe checkout session for subscription
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${SERVER}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
            cancel_url: `${CLIENT}/#/subscriptions/payment/cancel`,
            metadata: {
                userId
            },
        });

        //  Update subscription with stripe session ID
        await upsertSubscriptionPayment(userId, plan, region, session.id, true);

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


async function upsertSubscriptionPayment(userId, plan, region, sessionId, advanceMonth) {
    const Subscription = require('../models/subscription');
    const existing = await Subscription.findOne({
        userId,
        enabled: true
    })
    const now = new Date();
    const period = getPeriodStartEnd(now, !!advanceMonth);

    if (!existing) {
        //  Create a subscription
        const doc = new Subscription();
        doc.userId = userId;
        doc.plan = plan;
        const planInfo = getPlanInfo(plan);
        doc.booksPerMonth = planInfo.booksPerMonth;
        doc.price = planInfo.price;
        doc.periodStart = period.start;
        doc.periodEnd = period.end;
        doc.status = 'paused';
        doc.region = region;
        doc.currency = config.STRIPE.currency || 'usd';
        doc.provider = 'stripe';
        if (sessionId) doc.stripeSessionId = sessionId;
        const newRecord = await doc.save();
        return newRecord;

    } else {
        //  Update user subscription
        existing.plan = plan;
        const planInfo = getPlanInfo(plan);
        existing.booksPerMonth = planInfo.booksPerMonth;
        existing.price = planInfo.price;
        existing.periodStart = period.start;
        existing.periodEnd = period.end;
        existing.region = region;
        existing.currency = config.STRIPE.currency || 'usd';
        existing.provider = 'stripe';
        if (sessionId) existing.stripeSessionId = sessionId;
        await existing.save();
        return existing;
        
    }
}

function getPeriodStartEnd(now, advanceMonth) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const targetMonth = advanceMonth ? month + 1 : month;
    const start = new Date(year, targetMonth, 1, 0, 0, 0, 0);
    const end = new Date(year, targetMonth + 1, 1, 0, 0, 0, 0);
    return {
        start: start.getTime(),
        end: end.getTime()
    };
}

function getPlanInfo(plan) {
    const name = String(plan || '').toLowerCase();
    const product = getProductByPlan(name);
    const booksPerMonth = product && typeof product.booksPerMonth === 'number' ? product.booksPerMonth : 0;
    const price = product && typeof product.price === 'number' ? product.price : 0;

    return { booksPerMonth, price };
}

function getProductByPlan(plan) {
    const name = String(plan || '').toLowerCase();
    const products = (config.STRIPE && config.STRIPE.PRODUCTS) ? config.STRIPE.PRODUCTS : {};
    return products[name] || null;
}

module.exports = {
    run
}
