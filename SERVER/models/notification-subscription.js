const mongoose = require("mongoose");
const Schema = mongoose.Schema;
    
const model = new Schema({

    userId: { 
        type: String,
        index: true,
        required: true,
    },
    payload: { 
        type: Object,
        index: false,
        default: [],
    },

    enabled: { 
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Number,    // when was created
        default: Date.now
    },
    updatedAt: { 
        type: Number,    // when was last updated
        default: Date.now
    },
});

const m = mongoose.model("etmw2026_notification_subscription", model);
module.exports = m;