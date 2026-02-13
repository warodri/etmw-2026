const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_users",
        index: true,
        required: true
    },

    subscription: {     //  This is the record that was in the "subscription" schema
        type: Object
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

module.exports = mongoose.model("etmw2026_subscription_history", model);
