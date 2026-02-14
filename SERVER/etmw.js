const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
var fs = require('fs');
var https = require('https');

const JWT = require('./shared/jwt');
const SharedMongoose = require('./shared/mongoose');
const SharedRateLimiter = require('./shared/rate-limit');
const TasksRegistry = require('./task-registry');
const config = require('./config');
const DeviceTokenModel = require('./models/device-token');
const ios = require('./tasks/ios-apn');
const android = require('./tasks/android');
const seedCategories = require('./scripts/seedCategories');

const app = express();
const PORT = config.SERVER.port;
var http;

app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options'); 
    res.setHeader('Content-Security-Policy', 'frame-ancestors *'); // or use specific domains
    next();
});

//  For larger payloads in POSTs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.static('public'));

app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options'); // remove if already set
    res.setHeader('Content-Security-Policy', 'frame-ancestors *'); // or use specific domains
    next();
});

app.use(bodyParser.json());

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB in bytes
    },
});

/**
 * This tells Express to trust the X-Forwarded-For header, so req.ip will contain the real client’s IP address.
 * If a user connects via Cloudflare or Nginx, the X-Forwarded-For header may look like:
 * X-Forwarded-For: 203.0.113.42, 127.0.0.1
 */
app.set('trust proxy', true);

/**
 * Self explanatory
 */
JWT.initCookieParserAndJWT(app);
const apiLimiter = SharedRateLimiter.initRateLimit(app);

SharedMongoose.initMongoose( async () => {

    console.log('✅ MongoDB connection established');

    if (config.dev) {
        http = require("http").Server(app);
    } else {
        var options = {
            key: fs.readFileSync('/etc/letsencrypt/live/entertomyworld.com/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/entertomyworld.com/fullchain.pem'),
            requestCert: false,
            rejectUnauthorized: false
        }
        http = https.createServer(options, app);
    }

    /**
     * STRIPE SUCCESS
     */
    app.get('/api/stripe-success', apiLimiter, async (req, res) => {
        const { session_id, audiobook_id, user_id } = req.query;
        if (audiobook_id) {
            const StripeResult = require('./tasks/audiobook_stripe_result');
            await StripeResult.handleStripeSuccess(req, res);
        } else if (user_id) {
            const StripeResult = require('./tasks/subscription_stripe_result');
            await StripeResult.handleStripeSuccess(req, res);
        }

    })

    //  Downloads the content of a file
    app.get('/file/:id/:mimetype', apiLimiter, (req, res) => {
        const GetFile = require('./tasks/get-file');
        GetFile.run(req, res);
    })

    //  Stripe Success
    app.get('/file/:id/:mimetype', apiLimiter, (req, res) => {
        const GetFile = require('./tasks/get-file');
        GetFile.run(req, res);
    })

    //  All requests must arrive here
    app.post('/api/v1', apiLimiter, upload.single('file'), async (req, res) => {
        const { action, data } = req.body;
        await runTask(action, data, req, res);
    })
    //  All requests that need user validation must arrive here
    app.post('/api/v1/secure', JWT.authenticateJWT, apiLimiter, upload.single('file'), async (req, res) => {
        const { action, data } = req.body;
        await runTask(action, data, req, res);
    })

    // Run cleanup of old tokens on startup (tokens inactive for 90+ days)
    DeviceTokenModel.cleanupInactiveTokens(90);
    ///////////////////////////
    //  Enable all Apple part
    ///////////////////////////
    await ios.setup(app);
    ///////////////////////////
    //  Enable all Android part
    ///////////////////////////
    await android.setup(app);

    http.listen(PORT, '0.0.0.0', () => {
        console.log(`Enter To My World server listening on port ${PORT}`);
    })

})

/**
 * CREATE DYNAMIC INSTANCE OF TASK CLASSES
 * And pass the "data" along with "req" and "res"
 */
async function runTask(action, data, req, res) {
    const start = process.hrtime.bigint();

    if (!action) {
        return res.status(200).json({
            success: false,
            message: 'Invalid action'
        });
    }

    const task = TasksRegistry[action];

    if (task && typeof task.run === 'function') {
        await task.run(data, req, res);
    } else {
        return res.status(200).json({
            success: false,
            message: action + ' not found'
        });
    }

    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;

    if (action != 'NeiChatCountTotalUnreadMessages') {
        console.log(`Task ended ${action} in ${seconds.toFixed(3)}s`);
    }
}
