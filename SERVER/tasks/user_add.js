const User = require('../models/user');

async function run(data, req, res) {
    try {
        const {
            email,
            firstName,
            lastName,
            profilePicture,
            code
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const now = Date.now();
        const user = new User({
            email,
            firstName,
            lastName,
            profilePicture,
            code,
            enabled: true,
            createdAt: now,
            updatedAt: now
        });

        await user.save();

        return res.status(200).json({
            success: true,
            data: user
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