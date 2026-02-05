const Comment = require('../models/comment');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const comment = await Comment.findByIdAndDelete(id);

        if (!comment) {
            return res.status(200).json({
                success: false,
                message: 'Comment not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
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