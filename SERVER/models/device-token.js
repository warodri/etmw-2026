/**
 * MongoDB Schema for Device Tokens
 */

const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        default: 'apple',
        enum: ['apple', 'firebase']
    },
    platform: {
        type: String,
        default: 'ios',
        enum: ['ios', 'android']
    },
    destination: {
        type: String,
        default: 'intranet'
    },
    deviceInfo: {
        model: String,
        osVersion: String,
        appVersion: String
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
deviceTokenSchema.index({ userId: 1, platform: 1 });
deviceTokenSchema.index({ provider: 1, platform: 1 });

// Static method to remove old/inactive tokens
deviceTokenSchema.statics.cleanupInactiveTokens = async function(days = 90) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await this.deleteMany({
        lastActive: { $lt: cutoffDate }
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} inactive tokens`);
    return result;
};

// Update the updatedAt timestamp before saving
deviceTokenSchema.pre('save', function(next) {
    this.updatedAt = new Date();
});

// Method to check if token is for iOS
deviceTokenSchema.methods.isIOS = function() {
    return this.platform === 'ios' && this.provider === 'apple';
};

// Method to check if token is for Android
deviceTokenSchema.methods.isAndroid = function() {
    return this.platform === 'android' && this.provider === 'firebase';
};

// Static method to find all tokens for a user
deviceTokenSchema.statics.findByUserId = function(userId) {
    return this.find({ userId });
};

// Static method to find iOS tokens for a user
deviceTokenSchema.statics.findIOSTokens = function(userId) {
    return this.find({ 
        userId, 
        platform: 'ios',
        provider: 'apple'
    });
};

// Static method to find Android tokens for a user
deviceTokenSchema.statics.findAndroidTokens = function(userId) {
    return this.find({ 
        userId, 
        platform: 'android',
        provider: 'firebase'
    });
};

// Static method to clean up old/invalid tokens
deviceTokenSchema.statics.removeOldTokens = async function(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await this.deleteMany({
        updatedAt: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
};


const DeviceToken = mongoose.model('hc_device_tokens', deviceTokenSchema);
module.exports = DeviceToken;