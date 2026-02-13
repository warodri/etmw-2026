const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },

    plan: {
        type: String,
        enum: ['explorer', 'reader', 'unlimited'],
        index: true
    },

    booksPerMonth: {
        type: Number
        // null or 0 means unlimited
    },

    periodStart: {
        type: Number,
        index: true
    },

    periodEnd: {
        type: Number,
        index: true
    },

    status: {
        type: String,
        enum: ['active', 'paused', 'canceled', 'expired'],
        index: true
    },

    region: {
        type: String   // EU, LATAM, etc.
    },

    currency: {
        type: String
    },

    price: {
        type: Number   // snapshot at purchase time
    },

    provider: {
        type: String,  // stripe, mercadopago, etc.
        default: 'stripe'
    },

    enabled: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Number,
        default: Date.now,
        index: true
    },

    updatedAt: {
        type: Number,
        default: Date.now
    }

});

model.index(
    { userId: 1, status: 1 },
    { partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model("etmw2026_subscriptions", model);
