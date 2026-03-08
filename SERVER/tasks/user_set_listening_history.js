async function run(data, req, res) {
    try {
        const {
            audiobookId,
            chapterNumber,
            progressPercent,
            completed
        } = data;

        //  Validate user
        const userId = req.userId || null;
        const normalizedChapterNumber = Number(chapterNumber);
        if (!userId || !audiobookId || !Number.isFinite(normalizedChapterNumber) || normalizedChapterNumber <= 0) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        const normalizedProgress = Math.max(0, Math.min(100, Number(progressPercent || 0)));
        const normalizedCompleted = completed === true || normalizedProgress >= 99;

        //  Upsert user listening history (one record per user/book/chapter)
        const ListeningProgress = require('../models/listening_progress');
        const now = Date.now();
        try {
            await ListeningProgress.findOneAndUpdate(
                {
                    userId,
                    audiobookId,
                    chapterNumber: normalizedChapterNumber,
                    enabled: true
                },
                {
                    $set: {
                        progressPercent: normalizedProgress,
                        completed: normalizedCompleted,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        userId,
                        audiobookId,
                        chapterNumber: normalizedChapterNumber,
                        enabled: true,
                        createdAt: now
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );
        } catch (upsertErr) {
            // Backward-compatible path if DB still has old unique index on (userId, audiobookId).
            if (upsertErr && upsertErr.code === 11000) {
                await ListeningProgress.findOneAndUpdate(
                    {
                        userId,
                        audiobookId,
                        enabled: true
                    },
                    {
                        $set: {
                            chapterNumber: normalizedChapterNumber,
                            progressPercent: normalizedProgress,
                            completed: normalizedCompleted,
                            updatedAt: now
                        },
                        $setOnInsert: {
                            userId,
                            audiobookId,
                            enabled: true,
                            createdAt: now
                        }
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );
            } else {
                throw upsertErr;
            }
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
