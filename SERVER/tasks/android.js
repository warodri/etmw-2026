const config = require('../config')
const admin = require('firebase-admin');

// ============================================
// FIREBASE CLOUD MESSAGING (FCM) CONFIGURATION
// ============================================
/**
 * Configure Firebase Admin SDK
 * 
 * You need:
 * 1. Firebase service account JSON file
 * 2. Place it in your config folder
 * 3. Set the path in your config file
 * 
 * Get it from:
 * Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 */

let fcmInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    if (fcmInitialized) {
        console.log('✅ Firebase already initialized');
        return;
    }

    try {
        // Initialize with service account
        const serviceAccount = require(config.ANDROID.FCM_SERVICE_ACCOUNT_PATH);
        
        console.log('serviceAccount', serviceAccount)

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
        
        fcmInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log(`📱 Project ID: ${serviceAccount.project_id}`);
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        console.error('Make sure FCM_SERVICE_ACCOUNT_PATH in config points to your service account JSON file');
        throw error;
    }
}

//
//  CALL THIS FUNCTION FROM SERVER
//
async function setup(app) {
    
    console.log('🤖 Setting up Android FCM...')

    // Initialize Firebase
    try {
        initializeFirebase();
    } catch (error) {
        console.error('❌ Cannot setup Android endpoints without Firebase initialization');
        return;
    }

    /**
     * Health check endpoint
     */
    app.get('/android/health', async (req, res) => {
        //  Count total tokens
        const DeviceTokenModel = require('../models/device-token');
        const registeredDevices = await DeviceTokenModel.countDocuments({
            provider: 'firebase',
            platform: 'android'
        });
        //  Respond
        res.json({ 
            status: 'ok', 
            fcmConfigured: fcmInitialized,
            registeredDevices,
            projectId: admin.app().options.projectId || 'N/A'
        });
    });
    
    /**
     * Get list of subscribers
     */
    app.get('/android/subscribers/count', async (req, res) => {
        //  Get tokens
        const DeviceTokenModel = require('../models/device-token');
        const pushSubscribers = await DeviceTokenModel.find({
            provider: 'firebase',
            platform: 'android'
        }).select('userId email token createdAt updatedAt');
        //  Return
        res.json({ 
            count: pushSubscribers.length,
            pushSubscribers
        });
    });

    /**
     * Register device token (called from Android app)
     * 
     * Android app sends:
     * {
     *   action: "registerPushTokenForUserNoAuth",
     *   token: "fcm-device-token",
     *   email: "user@example.com",
     *   provider: "firebase",
     *   destination: "intranet"
     * }
     */
    app.post('/android/api/v1', async (req, res) => {
        try {
            const { action, token, email, provider, destination } = req.body;
            
            console.log('📱 Android API request:', { action, email, tokenPreview: token?.substring(0, 20) + '...' });
            
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
            
            // Validate FCM token format (basic check)
            if (token.length < 100) {
                console.warn('⚠️  Suspicious token length:', token.length);
            }
            
            // Use email as userId (or look up userId from your user database)
            const userId = email;
            
            const DeviceTokenModel = require('../models/device-token');

            await saveDeviceToken(userId, {
                token,
                email,
                provider: provider || 'firebase',
                destination: destination || 'intranet'
            }, DeviceTokenModel);
            
            console.log(`✅ Device registered - User: ${email}, Token: ${token.substring(0, 20)}...`);
            
            res.json({ 
                success: true, 
                message: 'Device token registered successfully',
                userId: userId,
                provider: 'firebase',
                platform: 'android'
            });
            
        } catch (error) {
            console.error('❌ Error registering device token:', error);
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
     *   token: "fcm-device-token"
     * }
     */
    app.post('/android/api/v1/register-token', async (req, res) => {
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
                provider: 'firebase',
                destination: 'intranet'
            }, DeviceTokenModel);
            
            console.log(`✅ Token linked to user - UserID: ${userId}, Token: ${token.substring(0, 20)}...`);
            
            res.json({ 
                success: true, 
                message: 'Device token linked to user successfully' 
            });
            
        } catch (error) {
            console.error('❌ Error linking device token:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Unregister device token (logout)
     */
    app.post('/android/api/v1/unregister-token', async (req, res) => {
        try {
            const { userId, token } = req.body;
            
            if (!userId && !token) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId or token is required' 
                });
            }
            
            const DeviceTokenModel = require('../models/device-token');
            
            if (userId) {
                await removeDeviceToken(userId, DeviceTokenModel);
            } else if (token) {
                await removeDeviceTokenByToken(token, DeviceTokenModel);
            }
            
            res.json({ 
                success: true, 
                message: 'Device token removed successfully' 
            });
            
        } catch (error) {
            console.error('❌ Error removing device token:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Send notification via API endpoint
     * 
     * POST /android/api/v1/send-notification
     * {
     *   userId: "user-123",
     *   title: "New Message",
     *   body: "You have a new message",
     *   url: "https://hometown.community/messages/123",
     *   badge: 1,
     *   data: { customKey: "customValue" }
     * }
     */
    app.post('/android/api/v1/send-notification', async (req, res) => {
        try {
            const { userId, title, body, url, imageUrl, data } = req.body;
            
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
                imageUrl,
                data
            });
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
            
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Send notification to multiple users
     * 
     * POST /android/api/v1/send-notification-bulk
     * {
     *   userIds: ["user-123", "user-456"],
     *   title: "New Announcement",
     *   body: "Check out the latest news",
     *   url: "https://hometown.community/news"
     * }
     */
    app.post('/android/api/v1/send-notification-bulk', async (req, res) => {
        try {
            const { userIds, title, body, url, imageUrl, data } = req.body;
            
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
                imageUrl,
                data                
            });
            
            res.json(result);
            
        } catch (error) {
            console.error('❌ Error sending bulk notification:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });

    /**
     * Test notification endpoint (useful for debugging)
     * 
     * POST /android/api/v1/test-notification
     * {
     *   token: "fcm-device-token"
     * }
     */
    app.post('/android/api/v1/test-notification', async (req, res) => {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'token is required' 
                });
            }
            
            const message = {
                notification: {
                    title: '🧪 Test Notification',
                    body: 'If you see this, FCM is working correctly!',
                },
                data: {
                    url: 'https://hometown.community/#/home',
                    testMessage: 'This is a test'
                },
                token: token
            };
            
            const response = await admin.messaging().send(message);
            
            console.log('✅ Test notification sent successfully:', response);
            res.json({ 
                success: true, 
                messageId: response,
                message: 'Test notification sent successfully'
            });
            
        } catch (error) {
            console.error('❌ Error sending test notification:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                details: error.errorInfo || error.code
            });
        }
    });

    console.log('✅ Android FCM configuration complete')
}

// ============================================
// DATABASE FUNCTIONS
// ============================================

/**
 * Save device token to database
 */
async function saveDeviceToken(userId, tokenData, DeviceTokenModel) {
    // Find existing token for this user and platform
    const existent = await DeviceTokenModel.findOne({
        userId,
        platform: 'android'
    });
    
    if (existent) {
        console.log('📝 Updating existing Android FCM token');
        existent.token = tokenData.token;
        existent.email = tokenData.email;
        existent.provider = tokenData.provider || 'firebase';
        existent.destination = tokenData.destination || 'intranet';
        existent.updatedAt = new Date();
        await existent.save();
    } else {
        //  Add new token
        console.log('📝 Creating new Android FCM token');
        const doc = new DeviceTokenModel();
        doc.userId = userId;
        doc.email = tokenData.email;
        doc.token = tokenData.token;
        doc.provider = tokenData.provider || 'firebase';
        doc.destination = tokenData.destination || 'intranet';
        doc.platform = 'android';
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
        provider: 'firebase',
        platform: 'android'
    });
    return existent;
}

/**
 * Remove device token by userId (for logout)
 */
async function removeDeviceToken(userId, DeviceTokenModel) {
    const result = await DeviceTokenModel.deleteMany({
        userId,
        platform: 'android'
    });
    console.log(`❌ Device tokens removed for user: ${userId}. Total removed: ${result.deletedCount}`);
    return result.deletedCount;
}

/**
 * Remove device token by token string
 */
async function removeDeviceTokenByToken(token, DeviceTokenModel) {
    const result = await DeviceTokenModel.deleteMany({
        token,
        platform: 'android'
    });
    console.log(`❌ Device token removed. Total removed: ${result.deletedCount}`);
    return result.deletedCount;
}

// ============================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send push notification to a single user via FCM
 * 
 * @param {string} userId - User ID or email
 * @param {object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.url - Optional URL to open (for deep linking)
 * @param {string} notification.imageUrl - Optional image URL
 * @param {object} notification.data - Optional custom data
 * @returns {Promise<object>} Result of the notification
 */
async function sendPushNotification(userId, notification) {

    console.log('sendPushNotification', notification)
    
    if (!fcmInitialized) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }
    
    const DeviceTokenModel = require('../models/device-token');
    const deviceData = await getDeviceToken(userId, DeviceTokenModel);
    
    if (!deviceData) {
        console.log(`⚠️  No device token found for user: ${userId}`);
        return { success: false, error: 'No device token found' };
    }
    
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📤 Sending push notification');
        console.log('   User:', userId);
        console.log('   Title:', notification.title);
        console.log('   Body:', notification.body);
        console.log('   URL:', notification.url || 'none');
        console.log('   Token:', deviceData.token.substring(0, 20) + '...');
        
        // CRITICAL CHANGE: Send as DATA-ONLY message (no notification field)
        // This ensures onMessageReceived is ALWAYS called, even when app is in background
        const message = {
            // ❌ DO NOT include notification field - it causes system to handle it
            // notification: { ... },  
            
            // ✅ Put everything in data field - this triggers onMessageReceived
            data: {
                title: notification.title || '',
                body: notification.body || '',
                url: notification.url || '',
                // Add any additional custom data
                ...(notification.data || {}),
                // Add optional fields
                imageUrl: notification.imageUrl || '',
                badge: (notification.badge || '').toString()
            },
            token: deviceData.token,
            
            // Android-specific options for data-only messages
            android: {
                priority: 'high',  // Ensures delivery even when app is in background
                // Set TTL (time to live) to 4 weeks
                ttl: 4 * 7 * 24 * 60 * 60 * 1000
            }
        };
        
        console.log('📦 FCM message structure (DATA-ONLY):');
        console.log(JSON.stringify(message, null, 2));
        
        // Send the message
        const response = await admin.messaging().send(message);
        
        console.log(`✅ Notification sent successfully`);
        console.log(`   Message ID: ${response}`);
        console.log(`   Type: DATA-ONLY (onMessageReceived will be called)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return { 
            success: true, 
            userId: userId,
            messageId: response
        };
        
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(`❌ Error sending notification to ${userId}`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Handle specific FCM errors
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.log(`🗑️  Removing invalid token for user: ${userId}`);
            await removeDeviceToken(userId, DeviceTokenModel);
        }
        
        return { 
            success: false, 
            error: error.message,
            errorCode: error.code,
            userId: userId 
        };
    }
}

/**
 * Send push notification to multiple users
 * Uses FCM's multicast messaging for efficiency
 * 
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - Notification data
 * @returns {Promise<object>} Results summary
 */
async function sendPushNotificationToMultiple(userIds, notification) {
    
    if (!fcmInitialized) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }
    
    const DeviceTokenModel = require('../models/device-token');
    
    // Get all device tokens for these users
    const deviceDocs = await DeviceTokenModel.find({
        userId: { $in: userIds },
        platform: 'android'
    });
    
    if (deviceDocs.length === 0) {
        console.log('⚠️  No device tokens found for any of the users');
        return {
            total: userIds.length,
            successful: 0,
            failed: userIds.length,
            error: 'No device tokens found'
        };
    }
    
    const tokens = deviceDocs.map(doc => doc.token);
    
    try {
        // Build multicast message
        const message = {
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: {
                url: notification.url || '',
                ...(notification.data || {})
            },
            tokens: tokens
        };
        
        // Add image if provided
        if (notification.imageUrl) {
            message.notification.imageUrl = notification.imageUrl;
        }
        
        // Android-specific options
        message.android = {
            priority: 'high',
            notification: {
                channelId: 'hometown_notifications',
                sound: 'default',
                color: '#6200EE'
            }
        };
        
        // Send to multiple devices
        const response = await admin.messaging().sendEachForMulticast(message);
        
        console.log(`📊 Bulk send complete - Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        // Handle failed tokens (remove invalid ones)
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`   Failed to send to token ${idx}:`, resp.error.code);
                    if (resp.error.code === 'messaging/invalid-registration-token' ||
                        resp.error.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });
            
            // Remove invalid tokens
            if (failedTokens.length > 0) {
                console.log(`🗑️  Removing ${failedTokens.length} invalid tokens`);
                await DeviceTokenModel.deleteMany({
                    token: { $in: failedTokens }
                });
            }
        }
        
        return {
            total: userIds.length,
            tokensFound: tokens.length,
            successful: response.successCount,
            failed: response.failureCount,
            responses: response.responses.map((resp, idx) => ({
                userId: deviceDocs[idx].userId,
                success: resp.success,
                messageId: resp.messageId,
                error: resp.error ? {
                    code: resp.error.code,
                    message: resp.error.message
                } : null
            }))
        };
        
    } catch (error) {
        console.error('❌ Error sending bulk notification:', error);
        return {
            total: userIds.length,
            successful: 0,
            failed: userIds.length,
            error: error.message
        };
    }
}

/**
 * Send notification to a topic (for broadcast messages)
 * 
 * @param {string} topic - Topic name (e.g., 'all-users', 'announcements')
 * @param {object} notification - Notification data
 * @returns {Promise<object>} Result of the notification
 */
async function sendNotificationToTopic(topic, notification) {
    
    if (!fcmInitialized) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }
    
    try {
        const message = {
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: {
                url: notification.url || '',
                ...(notification.data || {})
            },
            topic: topic
        };
        
        if (notification.imageUrl) {
            message.notification.imageUrl = notification.imageUrl;
        }
        
        message.android = {
            priority: 'high',
            notification: {
                channelId: 'hometown_notifications',
                sound: 'default',
                color: '#6200EE'
            }
        };
        
        const response = await admin.messaging().send(message);
        
        console.log(`✅ Notification sent to topic "${topic}": "${notification.title}"`);
        console.log(`   Message ID: ${response}`);
        
        return { 
            success: true, 
            topic: topic,
            messageId: response
        };
        
    } catch (error) {
        console.error(`❌ Error sending notification to topic "${topic}":`, error);
        return { 
            success: false, 
            error: error.message,
            topic: topic 
        };
    }
}

/**
 * Subscribe a device token to a topic
 */
async function subscribeToTopic(tokens, topic) {
    if (!fcmInitialized) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }
    
    try {
        const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
        const response = await admin.messaging().subscribeToTopic(tokensArray, topic);
        
        console.log(`✅ Subscribed ${response.successCount} tokens to topic: ${topic}`);
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    } catch (error) {
        console.error('❌ Error subscribing to topic:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Unsubscribe a device token from a topic
 */
async function unsubscribeFromTopic(tokens, topic) {
    if (!fcmInitialized) {
        console.error('❌ Firebase not initialized');
        return { success: false, error: 'Firebase not initialized' };
    }
    
    try {
        const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
        const response = await admin.messaging().unsubscribeFromTopic(tokensArray, topic);
        
        console.log(`✅ Unsubscribed ${response.successCount} tokens from topic: ${topic}`);
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    } catch (error) {
        console.error('❌ Error unsubscribing from topic:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    setup,
    sendPushNotification,
    sendPushNotificationToMultiple,
    sendNotificationToTopic,
    subscribeToTopic,
    unsubscribeFromTopic,
    initializeFirebase
};