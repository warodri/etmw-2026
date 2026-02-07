const mongoose = require("mongoose");
const Schema = mongoose.Schema;
    
const model = new Schema({

    code: { 
        type: String,
        index: true,
        required: true,
    },
    partnerName: { 
        type: String,
        index: false,
        required: true,
    },
    partnerDescription: { 
        type: String,
        index: false,
        required: true,
    },
    website: { 
        type: String,
        index: false,
        required: true,
    },
    linkToCode: { 
        type: String,
        index: false,
        required: true,
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

const m = mongoose.model("etmw2026_promo_codes", model);
module.exports = m;