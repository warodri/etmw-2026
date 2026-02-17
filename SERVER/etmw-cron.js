const SharedMongoose = require('./shared/mongoose');
const config = require('./config');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

/**
 * MONGODB IS CONNECTED
 */
SharedMongoose.initMongoose( async () => {

    console.log('✅ MongoDB connection established for CRON');

    //  Run: node etmw-cron.js --run to execute the function
    const runOnce = process.argv.includes('--run');
    if (runOnce) {
        try {
            await AddChapterToUser();
        } catch (ex) {
            console.error('CRON ERROR', ex.message);
        } finally {
            process.exit(0);
        }
    }

    //  Run every day at 1:00 AM server time
    cron.schedule('0 1 * * *', async () => {
        try {
            await AddChapterToUser();
        } catch (ex) {
            console.error('CRON ERROR', ex.message);
        }
    });
    
})

/**
 * ADDS THE NEXT CHAPTER TO READ FOR USERS IN THE 
 * NON-UNLIMITED PLAN.
 */
async function AddChapterToUser() {
    try {
        const processStartedAt = Date.now();
        console.log('PROCESS STARTED', (new Date()));

        const chaptersAddedForLaterReport = [];

        const Audiobook = require('./models/audiobook');
        const Subscription = require('./models/subscription');
        const UserChapterAvailable = require('./models/user_chapter_available');

        //  Loop each (user, audiobook) with the latest chapter available
        const latestByBook = await UserChapterAvailable.aggregate([
            { $match: { enabled: true } },
            {
                $group: {
                    _id: { userId: '$userId', audiobookId: '$audiobookId' },
                    chapterNumber: { $max: '$chapterNumber' }
                }
            }
        ]);

        for (let item of latestByBook) {
            const userId = item._id.userId;
            const audiobookId = item._id.audiobookId;
            const lastChapterNumberAdded = item.chapterNumber || 0;

            try {
                //  Validate subscription
                const sub = await Subscription.findOne({
                    userId,
                    status: 'active',
                    enabled: true
                });
                if (!sub) continue;
                if (sub.plan === 'unlimited') {
                    // Unlimited users should have access to all chapters without daily gating
                    continue;
                }

                //  This audiobook has more chapters?
                const audiobook = await Audiobook.findOne({
                    _id: audiobookId,
                    pipelineStatus: 'published',
                    published: true,
                    enabled: true
                });
                if (!audiobook || !Array.isArray(audiobook.audioFiles) || audiobook.audioFiles.length <= lastChapterNumberAdded) {
                    continue;
                }

                const nextChapterNumber = lastChapterNumberAdded + 1;

                //  Skip if already exists
                const already = await UserChapterAvailable.findOne({
                    userId,
                    audiobookId,
                    chapterNumber: nextChapterNumber,
                    enabled: true
                });
                if (already) continue;

                //  Add another chapter so this user can listen
                const doc = new UserChapterAvailable();
                doc.userId = userId;
                doc.audiobookId = audiobookId;
                doc.chapterNumber = nextChapterNumber;
                await doc.save();

                chaptersAddedForLaterReport.push({ userId, audiobook, nextChapterNumber });
            } catch (ex) {
                const payload = {
                    userId,
                    audiobookId,
                    lastChapterNumberAdded,
                    message: ex.message
                };
                console.error('CRON ITEM ERROR', payload);
                logCronError({
                    type: 'item_error',
                    ...payload
                });
                continue;
            }
        }

        const elapsedMs = Date.now() - processStartedAt;
        console.log('PROCESS FINISHED', (new Date()), `(${elapsedMs} ms)`);

    } catch (ex) {
        console.error('PROCESS ERROR', ex.message);
        logCronError({
            type: 'process_error',
            message: ex.message
        });
    }

}

function logCronError(data) {
    try {
        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        const dateStamp = new Date().toISOString().slice(0, 10);
        const filePath = path.join(logsDir, `cron-${dateStamp}.jsonl`);
        const record = {
            ts: new Date().toISOString(),
            ...data
        };
        fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, 'utf8');
    } catch (ex) {
        console.error('CRON LOG ERROR', ex.message);
    }
}
