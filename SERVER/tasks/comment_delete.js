const Comment = require('../models/comment');

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

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const id = payload.id;
        const userId = req.userId || null;

        if (!userId || !id) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const comment = await Comment.findOneAndDelete({
            _id: id,
            userId
        });

        if (!comment) {
            return res.status(200).json({
                success: false,
                message: 'Comment not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
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
