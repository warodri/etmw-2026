const User = require('../models/user');
const Author = require('../models/author');

function parsePayload(req, data) {
    let payload = (req.body && req.body.data) ? req.body.data : (data || {});
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch {
            payload = {};
        }
    }
    return payload || {};
}

function escapeRegex(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const query = String(payload.query || '').trim();
        const limit = Math.min(30, Math.max(1, parseInt(payload.limit, 10) || 10));

        const userId = req.userId || null;
        if (!userId || query.length < 2) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const safePattern = escapeRegex(query);
        const regex = new RegExp(safePattern, 'i');

        const usersByProfile = await User.find({
            enabled: { $ne: false },
            $or: [
                { firstName: regex },
                { lastName: regex },
                { email: regex }
            ]
        })
            .select('_id firstName lastName profilePicture email connected')
            .sort({ connected: -1, updatedAt: -1 })
            .limit(limit);

        const authors = await Author.find({
            enabled: { $ne: false },
            penName: regex
        })
            .populate('userId', '_id firstName lastName profilePicture connected')
            .limit(limit);

        const usersByAuthorPenName = authors
            .map((item) => item?.userId)
            .filter((item) => item && String(item._id) !== String(userId));

        const merged = new Map();
        for (const item of [...usersByProfile, ...usersByAuthorPenName]) {
            const id = String(item?._id || '');
            if (!id) continue;
            if (!merged.has(id)) {
                merged.set(id, item);
            }
        }
        const users = Array.from(merged.values()).slice(0, limit);

        return res.status(200).json({
            success: true,
            users
        });
    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename);
        console.log(ex.message);
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        });
    }
}

module.exports = {
    run
};
