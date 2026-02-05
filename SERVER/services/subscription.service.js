const Subscription = require('../models/etmw2026_subscriptions');

module.exports = {

    async getActiveSubscription(userId) {
        return Subscription.findOne({
            userId,
            status: 'active',
            periodEnd: { $gte: Date.now() }
        });
    },

    async createSubscription(payload) {
        return Subscription.create(payload);
    },

    async cancelSubscription(userId) {
        return Subscription.updateMany(
            { userId, status: 'active' },
            { status: 'canceled' }
        );
    }

};
