const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

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

function getExt(file) {
    const fromOriginal = path.extname(file?.originalname || '');
    const fromUploaded = path.extname(file?.filename || '');
    return (fromOriginal || fromUploaded || '').toLowerCase();
}

function getTargetRelativePath(story, pieceIndex, ext) {
    const isCover = pieceIndex === null || pieceIndex === undefined || pieceIndex < 0;
    const folder = `audiobooks/story/images/${story.audiobookId}`;
    let currentRelative = '';
    if (isCover) {
        currentRelative = story.image || '';
    } else {
        const piece = Array.isArray(story.chapterPieces) ? story.chapterPieces[pieceIndex] : null;
        currentRelative = piece?.audioImage || '';
    }

    if (currentRelative) {
        const parsed = path.parse(currentRelative);
        const basename = parsed.name;
        const dir = parsed.dir || folder;
        return path.posix.join(dir, `${basename}${ext}`);
    }

    const fallbackName = isCover
        ? `story_${story.chapterNumber || 1}_0`
        : `story_${story.chapterNumber || 1}_${pieceIndex}`;
    return `${folder}/${fallbackName}${ext}`;
}

async function safeMove(sourcePath, destinationPath) {
    try {
        await fsp.rename(sourcePath, destinationPath);
    } catch (ex) {
        if (ex && ex.code === 'EXDEV') {
            await fsp.copyFile(sourcePath, destinationPath);
            await fsp.unlink(sourcePath);
            return;
        }
        throw ex;
    }
}

async function run(data, req, res) {
    try {
        const payloadWrapper = parsePayload(req, data);
        const {
            _id,
            pieceIndex
        } = payloadWrapper;

        const file = req.file || null;

        if (!_id || !file) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        //  Find story
        const Story = require('../models/story');
        const story = await Story.findOne({
            _id,
            enabled: true
        })

        if (!story) {
            return res.status(200).json({
                success: false,
                message: 'Story not found'
            })
        }

        const index = pieceIndex !== undefined && pieceIndex !== null && pieceIndex !== ''
            ? Number(pieceIndex)
            : -1;
        const isCover = Number.isNaN(index) || index < 0;
        if (!isCover) {
            if (!Array.isArray(story.chapterPieces) || !story.chapterPieces[index]) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid pieceIndex'
                });
            }
        }

        const ext = getExt(file);
        if (!ext) {
            return res.status(200).json({
                success: false,
                message: 'Invalid file extension'
            });
        }

        const fromPath = file.path
            ? path.resolve(file.path)
            : path.resolve(path.join(__dirname, '../uploads', file.filename));
        const targetRelative = getTargetRelativePath(story, isCover ? -1 : index, ext);
        const toPath = path.resolve(path.join(__dirname, '..', targetRelative));
        const toDir = path.dirname(toPath);
        await fsp.mkdir(toDir, { recursive: true });

        let oldRelative = '';
        if (isCover) {
            oldRelative = story.image || '';
        } else {
            oldRelative = story.chapterPieces[index].audioImage || '';
        }

        await safeMove(fromPath, toPath);

        if (isCover) {
            story.image = targetRelative;
        } else {
            story.chapterPieces[index].audioImage = targetRelative;
            story.markModified('chapterPieces');
        }

        if (oldRelative && oldRelative !== targetRelative) {
            const oldPath = path.resolve(path.join(__dirname, '..', oldRelative));
            if (oldPath !== toPath && fs.existsSync(oldPath)) {
                try {
                    await fsp.unlink(oldPath);
                } catch (ex) {
                    // no-op
                }
            }
        }

        story.updatedAt = Date.now();
        await story.save();

        return res.status(200).json({
            success: true,
            filePath: targetRelative,
            story
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
