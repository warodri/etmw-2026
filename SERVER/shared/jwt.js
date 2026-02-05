const cookieParser = require('cookie-parser');
const config = require('../config');

/**
 * 🔹 Initialize Cookie Parser with JWT Secret
 */
const initCookieParserAndJWT = (app) => {
    app.use(cookieParser(config.SECRET_KEY));
};

/**
 * 🔹 Generate JWT Token & Set Secure Cookie
 */
const generateJWTAfterSuccessfulLogin = (userId, res) => {
    const jwt = require('jsonwebtoken');
    const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
    const token = jwt.sign({ userId }, config.SECRET_KEY, { expiresIn: '365d' });

    const cookieOptions = {
        httpOnly: true,
        path: '/',
        maxAge: ONE_YEAR,
    };

    if (config.dev) {
        // LOCALHOST
        cookieOptions.secure = false;
        cookieOptions.sameSite = 'Lax';
        // DO NOT set domain in dev
    } else {
        // PRODUCTION
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'None';
        cookieOptions.domain = 'hometown.community';
    }

    res.cookie('auth_token_hc', token, cookieOptions);
    return token;
};


/**
 * 🔹 Middleware to Verify JWT Token
 */
const authenticateJWT = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        //  From Headers
        token = authHeader.split(' ')[1]; // Extract token after "Bearer"
    } else {
        //  From cookies
        token = req.cookies.auth_token_hc;         
    }
    if (!token) {
        return res.status(200).json({ 
            success: false,
            message: 'Seems like you must login to continue with this' 
        });
    }
    try {
        const decoded = jwt.verify(token, config.SECRET_KEY);
        if (decoded && decoded.userId) {
            req.userId = decoded.userId; // Attach user data to request
            next();
        } else {
            return res.status(200).json({ 
                success: false,
                message: 'Unauthorized - Invalid Token' 
            });    
        }
    } catch (err) {
        console.log('authenticateJWT', err.message)
        return res.status(403).json({ message: 'Forbidden - Invalid Token' });
    }
};

/**
 * 🔹 Logout & Clear Cookie
 */
const logoutUser = (res) => {
    res.clearCookie('auth_token_hc', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { 
    initCookieParserAndJWT, 
    generateJWTAfterSuccessfulLogin, 
    authenticateJWT, 
    logoutUser 
};

