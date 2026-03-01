const mongoose = require("mongoose");
const Schema = mongoose.Schema;
    
const model = new Schema({

    sendToUserId: { 
        type: String,
        index: true,
        required: true,
    },
    code: { 
        type: String,
        index: true,
        enum: [
            'new-chapter-available',
            'liked-author-uploads-audiobook',
            'author-i-follow-joins-debate',
            'new-debate-starts-about-liked-author',
            'new-debate-starts-about-liked-audiobook',
            'user-adds-comment-to-one-of-my-debates',
            'someone-replied-to-my-comment',
            'my-audiobook-progress-reminder',
            'weekly-digest',
            'you-are-subscribed',
            'your-subscription-plan-changed'
        ]
    },
    recordDetail: { 
        type: Object,
        default: {}         //  Example: { audiobookId: '1234567', chapterNumber: 2 }
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

const m = mongoose.model("etmw2026_notification_queue_sent", model);
module.exports = m;