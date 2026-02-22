async function run(data, req, res) {
    try {
        const {
            audiobookId,
            text,
            commentId,
            parentMessageId
        } = req.body;

        const userId = req.userId;
        const trimmedText = String(text || '').trim();
        const hasFile = !!req.file;

        if (!userId || !audiobookId || (!trimmedText && !hasFile)) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Add / Find a debate for this audiobook
        const Debate = require('../models/debate');
        let debate = await Debate.findOne({
            audiobookId,
            enabled: true
        })
        if (!debate) {
            const doc = new Debate();
            doc.userId = userId,
            doc.audiobookId = audiobookId;
            debate = await doc.save();
        }
        if (!debate) {
            return res.status(200).json({
                success: false,
                message: 'Unable to find a debate for this audiobook'
            })
        }

        //  Debate comments
        const DebateComments = require('../models/debate_comment');
        let comment = null;

        //  The comment exists?
        if (commentId) {
            comment = await DebateComments.findOne({
                _id: commentId,
                audiobookId,
                enabled: true
            })
        }

        //  If comment doesn't exist, create one
        if (!comment) {
            const doc = new DebateComments();
            doc.audiobookId = audiobookId;
            doc.debateId = debate._id;
            doc.userId = userId;
            comment = await doc.save();
        }
        if (!comment) {
            return res.status(200).json({
                success: false,
                message: 'Unable to find or create your comment'
            })
        }

        //  Update fields
        comment.text = trimmedText;
        comment.parentMessageId = parentMessageId || null;
        comment.updatedAt = Date.now();
        if (req.file) {
            if (req.file.mimetype.indexOf('audio') > -1) {
                comment.audioUrl = req.file.filename;
            } else {
                const existing = Array.isArray(comment.attachments)
                    ? comment.attachments
                    : (comment.attachments && typeof comment.attachments === 'object'
                        ? Object.values(comment.attachments)
                        : []);
                comment.attachments = [
                    ...existing,
                    {
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    originalname: req.file.originalname
                    }
                ];
                comment.hasAttachments = true;
                comment.markModified('attachments');
            }
        }

        //  Store changes
        await comment.save();

        const totalComments = await DebateComments.countDocuments({
            audiobookId,
            enabled: true
        });
        
        return res.status(200).json({
            success: true,
            comment,
            totalComments
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
