
async function run(data, req, res) {
    try {
        const {
            followingUserId,
        } = data;
        
        const userId = req.userId || null;

        if (!userId || !followingUserId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const Follow = require('../models/follow');

        const item = await Follow.findOne({
            userId,
            followingUserId,
            enabled: true
        });

        if (item) {
            //  Remove
            await Follow.deleteOne({
                userId,
                followingUserId,
                enabled: true
            });
        } else {
            // Add
            const doc = new Follow();
            doc.userId = userId;
            doc.followingUserId = followingUserId;
            await doc.save();
        }
        
        return res.status(200).json({
            success: true,
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