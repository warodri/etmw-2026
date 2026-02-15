const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    userId: {
        type: String,
        required: false
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
        default: Date.now,
        index: true
    }

});

module.exports = mongoose.model("etmw2026_contact", model);
