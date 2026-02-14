const User = require('../models/user');

async function run(data, req, res) {
    try {
        const {
            firstName,
            lastName,
            city,
            languages,
            country,
            profilePicture,
            coverPicture,
            isAuthor,
            bio,
            connected,
            forceStatus,
            totalFollowers,
            totalFollowing,
            lastCheckTime,
            lastUnreadMessages,
        } = data;

        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (city !== undefined) updateData.city = city;
        if (country !== undefined) updateData.country = country;
        if (languages !== undefined) updateData.languages = languages;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (coverPicture !== undefined) updateData.coverPicture = coverPicture;
        if (isAuthor !== undefined) updateData.isAuthor = isAuthor;
        if (bio !== undefined) updateData.bio = bio;
        if (connected !== undefined) updateData.connected = connected;
        if (forceStatus !== undefined) updateData.forceStatus = forceStatus;
        if (totalFollowers !== undefined) updateData.totalFollowers = totalFollowers;
        if (totalFollowing !== undefined) updateData.totalFollowing = totalFollowing;
        if (lastCheckTime !== undefined) updateData.lastCheckTime = lastCheckTime;
        if (lastUnreadMessages !== undefined) updateData.lastUnreadMessages = lastUnreadMessages;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            user
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