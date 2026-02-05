const config = require('../config')
const apn = require('apn');

// ============================================
// APNs CONFIGURATION
// ============================================
/**
 * Configure APNs Provider
 * 
 * You need to create an APNs key at:
 * https://developer.apple.com/account/resources/authkeys/list
 * 
 * Steps:
 * 1. Go to Apple Developer Portal
 * 2. Certificates, Identifiers & Profiles
 * 3. Keys → Create a new key
 * 4. Enable "Apple Push Notifications service (APNs)"
 * 5. Download the .p8 file
 * 6. Note your Key ID and Team ID
 */

const apnOptions = {
    token: {
        key: config.IOS.APNS_KEY_PATH,  // Path to your .p8 file
        keyId: config.IOS.APNS_KEY_ID,  // Your 10-character Key ID
        teamId: config.IOS.APNS_TEAM_ID // Your 10-character Team ID
    },
    production: config.IOS.isTest ? false : true  // false for development, true for production
};

let apnProvider;

//
//  CALL THIS FUNCTION FROM SERVER
//
async function setup(app) {
    
    console.log('Setting up ios...')

    try {
        apnProvider = new apn.Provider(apnOptions);
        console.log('✅ APNs Provider initialized', apnOptions);
    } catch (error) {
        console.error('❌ Failed to initialize APNs Provider:', error.message);
        console.log('⚠️  Push notifications will not work until APNs is configured');
    }    

    /**
     * Health check endpoint
     */
    app.get('/ios/health', async (req, res) => {
        //  Count total tokens
        const DeviceTokenModel = require('../models/device-token');
        const registeredDevices = await DeviceTokenModel.countDocuments({
            provider: 'apple'
        });
        //  Respond
        res.json({ 
            status: 'ok', 
            apnsConfigured: !!apnProvider,
            registeredDevices
        });
    });
    
    /**
     * Health check endpoint
     */
    app.get('/ios/subscribers/count', async (req, res) => {
        //  Get tokens
        const DeviceTokenModel = require('../models/device-token');
        const pushSubscribers = await DeviceTokenModel.find({
            provider: 'apple'
        });
        //  Return
        res.json({ 
            pushSubscribers
        });
    });

    /**
     * Register device token (called from iOS app)
     * 
     * iOS app sends:
     * {
     *   action: "registerPushTokenForUserNoAuth",
     *   token: "device-token-from-apple",
     *   email: "user@example.com",
     *   provider: "apple",
     *   destination: "intranet"
     * }
     */
    app.post('/ios/api/v1', async (req, res) => {
        try {
            const { action, token, email, provider, destination } = req.body;
            
            if (action !== 'registerPushTokenForUserNoAuth') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action' 
                });
            }
            
            if (!token || !email) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Token and email are required' 
                });
            }
            
            // Use email as userId (or look up userId from your user database)
            const userId = email;
            
            const DeviceTokenModel = require('../models/device-token');

            await saveDeviceToken(userId, {
                token,
                email,
                provider: provider || 'apple',
                destination: destination || 'intranet'
            }, DeviceTokenModel);
            
            console.log(`📱 Device registered - User: ${email}, Token: ${token.substring(0, 10)}...`);
            
            res.json({ 
                success: true, 
                message: 'Device token registered successfully',
                userId: userId
            });
            
        } catch (error) {
            console.error('Error registering device token:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Register token with userId (called from Angular after login)
     * 
     * Angular sends:
     * {
     *   userId: "user-123",
     *   email: "user@example.com",
     *   token: "device-token-from-window.deviceToken"
     * }
     */
    app.post('/ios/api/v1/register-token', async (req, res) => {
        try {
            const { userId, email, token } = req.body;
            
            if (!userId || !token) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId and token are required' 
                });
            }
            
            const DeviceTokenModel = require('../models/device-token');

            await saveDeviceToken(userId, {
                token,
                email: email || userId,
                provider: 'apple',
                destination: 'intranet'
            }, DeviceTokenModel);
            
            console.log(`📱 Token linked to user - UserID: ${userId}, Token: ${token.substring(0, 10)}...`);
            
            res.json({ 
                success: true, 
                message: 'Device token linked to user successfully' 
            });
            
        } catch (error) {
            console.error('Error linking device token:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Unregister device token (logout)
     */
    app.post('/ios/api/v1/unregister-token', async (req, res) => {
        try {
            const { userId } = req.body;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId is required' 
                });
            }
            
            const DeviceTokenModel = require('../models/device-token')
            await removeDeviceToken(userId, DeviceTokenModel);
            
            res.json({ 
                success: true, 
                message: 'Device token removed successfully' 
            });
            
        } catch (error) {
            console.error('Error removing device token:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Send notification via API endpoint
     * 
     * POST /api/v1/send-notification
     * {
     *   userId: "user-123",
     *   title: "New Message",
     *   body: "You have a new message",
     *   url: "https://hometown.community/messages/123",
     *   badge: 1
     * }
     */
    app.post('/ios/api/v1/send-notification', async (req, res) => {
        try {
            const { userId, title, body, url, badge, data } = req.body;
            
            if (!userId || !title || !body) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId, title, and body are required' 
                });
            }
            
            const result = await sendPushNotification(userId, {
                title,
                body,
                url,
                badge,
                data
            });
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
            
        } catch (error) {
            console.error('Error sending notification:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Send notification to multiple users
     * 
     * POST /api/v1/send-notification-bulk
     * {
     *   userIds: ["user-123", "user-456"],
     *   title: "New Announcement",
     *   body: "Check out the latest news",
     *   url: "https://hometown.community/news"
     * }
     */
    app.post('/ios/api/v1/send-notification-bulk', async (req, res) => {
        try {
            const { userIds, title, body, url, badge, data } = req.body;
            
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userIds array is required' 
                });
            }
            
            if (!title || !body) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'title and body are required' 
                });
            }
            
            const result = await sendPushNotificationToMultiple(userIds, {
                title,
                body,
                url,
                badge,
                data                
            });
            
            res.json(result);
            
        } catch (error) {
            console.error('Error sending bulk notification:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });    

    console.log('iOS Setup cone')

}

/**
 * Save device token to database
 */
async function saveDeviceToken(userId, tokenData, DeviceTokenModel) {
    const existent = await DeviceTokenModel.findOne({
        userId,
    })
    if (existent) {
        console.log('Update existent Apple Push token')
        existent.token = tokenData.token;
        await existent.save();
    } else {
        //  Add token
        console.log('Create new Apple Push token')
        const doc = new DeviceTokenModel();
        doc.userId = userId;
        doc.email = tokenData.email;
        doc.token = tokenData.token;
        doc.provider = tokenData.provider || 'apple';
        doc.destination = tokenData.destination || 'intranet';
        doc.platform = 'ios';
        await doc.save();
    }    
    console.log(`✅ Device token saved for user: ${userId}`);
    return true;
}

/**
 * Get device token for a user
 */
async function getDeviceToken(userId, DeviceTokenModel) {
    const existent = await DeviceTokenModel.findOne({
        userId,
        provider: 'apple'
    })
    return existent;
}

/**
 * Remove device token (for logout)
 */
async function removeDeviceToken(userId, DeviceTokenModel) {
    const totalRemoved = await DeviceTokenModel.deleteMany({
        userId,
    })
    console.log(`❌ Device token removed for user: ${userId}. Total removed:` + totalRemoved);
}

// ============================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send push notification to a single user
 * 
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.url - Optional URL to open
 * @param {number} notification.badge - Optional badge count
 * @param {object} notification.data - Optional custom data
 * @returns {Promise<object>} Result of the notification
 */
async function sendPushNotification(userEmail, notification) {
    
    if (!apnProvider) {
        console.error('❌ APNs Provider not configured');
        return { success: false, error: 'APNs not configured' };
    }
    
    const DeviceTokenModel = require('../models/device-token');
    const deviceData = await getDeviceToken(userEmail, DeviceTokenModel);
    
    if (!deviceData) {
        console.log(`⚠️  No device token found for user: ${userEmail}`);
        return { success: false, error: 'No device token found' };
    }
    
    const apnNotification = new apn.Notification();
    
    // Alert
    apnNotification.alert = {
        title: notification.title,
        body: notification.body
    };
    
    // Badge
    if (notification.badge !== undefined) {
        apnNotification.badge = notification.badge;
    }
    
    // Sound
    apnNotification.sound = notification.sound || 'default';
    
    // Topic (your app's bundle ID)
    apnNotification.topic = config.IOS.APP_BUNDLE_ID;
    
    // Custom payload
    apnNotification.payload = {
        ...notification.data
    };
    
    // Add URL if provided (for deep linking)
    if (notification.url) {
        apnNotification.payload.url = notification.url;
    }
    
    // Expiry (notification valid for 1 hour)
    apnNotification.expiry = Math.floor(Date.now() / 1000) + 3600;
    
    // Priority (10 = immediate, 5 = power-saving mode)
    apnNotification.priority = 10;
    
    try {
        const result = await apnProvider.send(apnNotification, deviceData.token);
        
        if (result.failed.length > 0) {
            const failure = result.failed[0];
            console.error(`❌ Failed to send notification to ${userEmail}:`, failure.response);
            
            // If token is invalid, remove it from database
            if (failure.response && failure.response.reason === 'BadDeviceToken') {
                // const DeviceTokenModel = require('../models/device-token')
                // await removeDeviceToken(userEmail, DeviceTokenModel);
            }
            
            return { 
                success: false, 
                error: failure.response.reason,
                userId: userEmail 
            };
        }
        
        console.log(`✅ Notification sent to ${userEmail}: "${notification.title}"`);
        return { 
            success: true, 
            userId: userEmail,
            sent: result.sent.length 
        };
        
    } catch (error) {
        console.error(`❌ Error sending notification to ${userEmail}:`, error);
        return { 
            success: false, 
            error: error.message,
            userId: userEmail 
        };
    }
}

/**
 * Send push notification to multiple users
 * 
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - Notification data
 * @returns {Promise<object>} Results summary
 */
async function sendPushNotificationToMultiple(userIds, notification) {
    const results = await Promise.all(
        userIds.map(userId => sendPushNotification(userId, notification))
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Bulk send complete - Success: ${successful}, Failed: ${failed}`);
    
    return {
        total: userIds.length,
        successful,
        failed,
        results
    };
}


module.exports = {
    setup,
    sendPushNotification
}