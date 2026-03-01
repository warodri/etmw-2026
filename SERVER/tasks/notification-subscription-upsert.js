const jwt = require('jsonwebtoken');
const config = require('../config')

async function run(data, req, res) {
    try {
        const {
            token,
            payload
        } = data

        if (!token) {
            return res.status(200).json({
                success: false,
                message: 'Invalid token'
            })
        }

        //  Decode the token to get the userId
        const info = decodeToken(token);
        if (!info || !info.userId) {
            return res.status(200).json({
                success: false,
                message: 'Unable to read user info'
            })
        }

        //  Store the payload
        const NotificationSubscription = require('../models/notification-subscription');
        const doc = await NotificationSubscription.findOne({
            userId: info.userId,
            enabled: true
        })
        if (!doc) {
            
            //  It's not possible, because we create one when we do GET
            return res.status(200).json({
                success: false,
                message: 'Unknown error. Please try again'
            })

        } else {

            //  Update
            doc.payload = payload;
            doc.updatedAt = Date.now();
            await doc.save();
            
            //  Return 
            return res.status(200).json({
                success: true,
            })
        }


    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, config.SECRET_KEY);
        // Example payload:
        // { userId: '12345', name: 'Walter', iat: ..., exp: ... }
        return {
            userId: decoded.userId,
            name: decoded.name
        };
    } catch (err) {
        console.error('Invalid or expired token');
        return null;
    }
}

module.exports = {
    run
}