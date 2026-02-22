function parsePayload(req, data) {
    let payload = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch (ex) {
            payload = {};
        }
    }
    return payload || {};
}

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const {
            audiobookId,
            skip,
            limit
        } = payload;

        const userId = req.userId || null;

        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const parsedSkip = Math.max(0, parseInt(skip, 10) || 0);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

        const DebatePodcasts = require('../models/debate_podcast');
        const mongoQuery = {
            audiobookId,
            enabled: true
        };

        const [podcasts, total] = await Promise.all([
            DebatePodcasts.find(mongoQuery)
                .sort({ createdAt: -1 })
                .skip(parsedSkip)
                .limit(parsedLimit),
            DebatePodcasts.countDocuments(mongoQuery)
        ]);

        const hasMore = (parsedSkip + podcasts.length) < total;

        return res.status(200).json({
            success: true,
            podcasts,
            hasMore,
            total
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
