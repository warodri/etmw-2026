const rateLimit = require('express-rate-limit');

const initRateLimit = (app) => {

    //  Rate Limit by User ID Instead of IP?
    //  logged-in users are tracked by their ID, and guests by IP.
    //////////////////////////////////////////////////////////////
    // This allows:
    //     - 1 request every ~36 seconds, or bursts of several within a short time
    //     - Plenty of headroom for real users reading comics
    //     - Still effective against low-effort abuse
    //////////////////////////////////////////////////////////////
    const apiLimiter = rateLimit({
        windowMs: 1000, // 1 second
        max: 300,        // 300 requests per second
        message: 'Too many requests. Please try again later.',
        keyGenerator: (req, res) => req.userId || req.ip
    })

    //  Blocks by IP
    // const apiLimiter = rateLimit({
    //     windowMs: 15 * 60 * 1000, // 15 minutes
    //     max: 100, // Limit each IP to 100 requests per windowMs
    //     message: 'Too many requests from this IP, please try again later.'
    // })

    // Apply to Specific Route Only
    // app.use('/api/reading-history', rateLimit({
    //     windowMs: 5 * 60 * 1000, // 5 minutes
    //     max: 30, // 30 requests per 5 minutes per IP
    //     message: 'Too many reads. Slow down a bit!'
    // }))

    //  Custom Handler
    // app.use('/api/submit-feedback', rateLimit({
    //     windowMs: 1 * 60 * 1000, // 1 minute
    //     max: 3,
    //     handler: (req, res) => {
    //         return res.status(429).json({
    //             success: false,
    //             message: 'Too many submissions. Try again in a moment.'
    //         });
    //     }
    // }))

    app.use(apiLimiter);

    return apiLimiter;
}

module.exports = { initRateLimit }


