
async function run(data, req, res) {
    try {
        const {
            userIdFollowing
        } = data;
        
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const Follow = require('../models/follow');

        let followingThisUser = false;
        if(userIdFollowing) {
            const item = await Follow.findOne({
                userId,
                followingUserId: userIdFollowing,
                enabled: true
            })
            if (item) followingThisUser = true;
        }
        const following = await Follow.countDocuments({
            userId,
            enabled: true
        })
        const followers = await Follow.countDocuments({
            followingUserId: userId,
            enabled: true
        })
        
        return res.status(200).json({
            success: true,
            followers,
            following,
            followingThisUser
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