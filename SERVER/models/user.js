const mongoose = require("mongoose");
const Schema = mongoose.Schema;
    
const model = new Schema({

    email: { 
        type: String,
        index: true,
    },
    firstName: { 
        type: String
    },
    lastName: { 
        type: String
    },
    profilePicture: { 
        type: String
    },
    code: { 
        type: String
    },
    lastIp: { 
        type: String
    },
    lastBrowserAgent: { 
        type: String
    },
    connected: { 
        type: Boolean,
        default: true
    },
    forceStatus: {
        type: String,
        enum: ['connected', 'disconnected'],
        default: null
    },

    //  Social
    totalFollowers: {
        type: Number,
        default: 0
    },
    totlaFollowing: {
        type: Number,
        default: 0
    },

    //  Notifications
    lastCheckTime: {        //  when was the last timestamp we checked for unread
        type: Number,
        default: 0
    },
    lastUnreadMessages: {   //  How many unread notifications since the last check?
        type: Number,
        default: 0
    },

    enabled: { type: Boolean, index: true },
    createdAt: { type: Number, index: true },
    updatedAt: { type: Number, index: true },
});

const m = mongoose.model("etmw2026_users", model);
module.exports = m;