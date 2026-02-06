const JWT = require('../shared/jwt');

async function run(data, req, res) {
    try {
        const {
            email,
            code
        } = data;

        //  Validate
        if (!email || !code) {
            return res.status(200).json({
                success: false,
                message: 'Missing data'
            })
        }

        //  Imports to use
        const UserModel = require('../models/user');

        //  Email exists? 
        const user = await UserModel.findOne({
            email,
            enabled: true
        })
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }
        if (user.code != code) {
            return res.status(200).json({
                success: false,
                message: 'Invalid code'
            })
        }

        //  WRITE THE JWT VALIDATING THIS SESION
        const token = JWT.generateJWTAfterSuccessfulLogin(user._id, res);

        //  Clear code and store the token
        user.code = null;
        user.sessionToken = token;
        await user.save();
        
        //  Finally respond to client
        res.status(200).json({
            success: true,
            user,
            token
        })
        
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

module.exports = {
    run
}