const User = require('../models/user');

async function run(data, req, res) {
    try {
        const {
            id,
            email,
            firstName,
            lastName,
            profilePicture,
            code,
            lastIp,
            lastBrowserAgent,
            connected,
            forceStatus,
            totalFollowers,
            totlaFollowing,
            lastCheckTime,
            lastUnreadMessages,
            enabled
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (email !== undefined) updateData.email = email;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (code !== undefined) updateData.code = code;
        if (lastIp !== undefined) updateData.lastIp = lastIp;
        if (lastBrowserAgent !== undefined) updateData.lastBrowserAgent = lastBrowserAgent;
        if (connected !== undefined) updateData.connected = connected;
        if (forceStatus !== undefined) updateData.forceStatus = forceStatus;
        if (totalFollowers !== undefined) updateData.totalFollowers = totalFollowers;
        if (totlaFollowing !== undefined) updateData.totlaFollowing = totlaFollowing;
        if (lastCheckTime !== undefined) updateData.lastCheckTime = lastCheckTime;
        if (lastUnreadMessages !== undefined) updateData.lastUnreadMessages = lastUnreadMessages;
        if (enabled !== undefined) updateData.enabled = enabled;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'User not found'
            })
        }

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