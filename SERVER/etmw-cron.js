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
 * This is a cron process running once a day.
 * The main task is to add a new chapter for subscribed users to listen to, every day.
 * We allow one new chapter for users every day. Only if they have the plan "reader" or "explorer". 
 * Users with plan "unlimited" can read any chapter of any audiobook.
 * 
 * The base folder for models is: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/models
 * 1) Check the model /listening_progress.js and get the userId
 * 2) Open the model subscription.js and find the subscription by userId
 *  - The field "plan" is "explorer" or "reader"? Then continuw with 3)
 *  - Otherwise, don't do anything
 * 3) The record read from /listening_progress.js will give you the audiobooks the userId started reading (normally is chapter 1)
 * 4) See if the audiobook has a new chapter. You can see chapters by using the model /audiobook.js
 *  - Then get the userId and the last number of chapter the user is listening to (for example: Chapter 1)
 * 5) If the audiobook has a new chapter (for example, Chapter 2, Chapter 3 and Chapter 4)
 *  - Grab the next chapter (Chapter 2, for this example) and add it to this model: /user_chapter_available.js for the userId to read next chapter
 * 6) Add an entry to this model notification-queue.js using the code 'new-chapter-available' 
 *  - The field "recordDetail" must be the next chapter available to read and the audiobookId. Example: { audiobookId: '1234567', chapterNumber: 2 }
 */
async function AddChapterToUser() {
    try {
        const processStartedAt = Date.now();
        console.log('AddChapterToUser - PROCESS STARTED', (new Date()));

        const chaptersAddedForLaterReport = [];

        const Audiobook = require('./models/audiobook');
        const ListeningProgress = require('./models/listening_progress');
        const Subscription = require('./models/subscription');
        const UserChapterAvailable = require('./models/user_chapter_available');
        const NotificationQueue = require('./models/notification-queue');

        //  Daily boundaries (server timezone)
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime();

        //  Active plans eligible for daily unlocks
        const activeSubs = await Subscription.find({
            enabled: true,
            status: 'active',
            plan: { $in: ['explorer', 'reader'] }
        }).select('userId plan');

        if (!activeSubs || activeSubs.length === 0) {
            const elapsedMsNoSubs = Date.now() - processStartedAt;
            console.log('AddChapterToUser - No active explorer/reader subscriptions', `(${elapsedMsNoSubs} ms)`);
            return;
        }

        const subscribedUsers = new Set(activeSubs.map((s) => String(s.userId)));

        //  Find active listening activity
        const progressRows = await ListeningProgress.find({
            enabled: true,
            completed: false
        })
            .sort({ updatedAt: -1 })
            .select('userId audiobookId chapterNumber updatedAt');

        if (!progressRows || progressRows.length === 0) {
            const elapsedMsNoProgress = Date.now() - processStartedAt;
            console.log('AddChapterToUser - No active listening progress', `(${elapsedMsNoProgress} ms)`);
            return;
        } else {
            console.log('AddChapterToUser - Found ' + progressRows.length +' active listening progress');
        }

        //  Group progress by subscribed user, keep most recently updated rows first
        const progressByUser = new Map();
        for (const row of progressRows) {
            const uid = String(row.userId || '');
            if (!uid || !subscribedUsers.has(uid)) continue;
            if (!progressByUser.has(uid)) progressByUser.set(uid, []);
            progressByUser.get(uid).push(row);
        }

        //  Cache audiobook lookups
        const audiobookCache = new Map();

        //  One chapter unlock per user per day
        for (const [uid, userRows] of progressByUser.entries()) {

            //  Idempotency: if the user already received a chapter today, skip
            const alreadyUnlockedToday = await UserChapterAvailable.findOne({
                userId: uid,
                enabled: true,
                createdAt: { $gte: dayStart, $lt: dayEnd }
            }).select('_id');
            if (alreadyUnlockedToday) continue;

            let unlockedForUser = false;

            //  Pick the first valid "currently-reading" candidate (most recent first)
            for (const row of userRows) {
                const audiobookId = String(row.audiobookId || '');
                if (!audiobookId) continue;

                let audiobook = audiobookCache.get(audiobookId);
                if (!audiobook) {
                    audiobook = await Audiobook.findOne({
                        _id: audiobookId,
                        enabled: true,
                        published: true,
                        pipelineStatus: 'published'
                    }).select('_id title totalChapters audioFiles');
                    audiobookCache.set(audiobookId, audiobook || null);
                }
                if (!audiobook) continue;

                const currentChapter = Number(row.chapterNumber) > 0 ? Number(row.chapterNumber) : 1;
                const nextChapter = currentChapter + 1;

                const hasNextChapter = Array.isArray(audiobook.audioFiles) &&
                    audiobook.audioFiles.some((f) => Number(f.chapter) === nextChapter && !!f.url);
                if (!hasNextChapter) continue;

                //  If already unlocked, no need to add/queue again
                const alreadyUnlocked = await UserChapterAvailable.findOne({
                    userId: uid,
                    audiobookId,
                    chapterNumber: nextChapter,
                    enabled: true
                }).select('_id');
                if (alreadyUnlocked) {
                    unlockedForUser = true;
                    break;
                }

                //  Add next chapter availability
                const chapterDoc = new UserChapterAvailable();
                chapterDoc.userId = uid;
                chapterDoc.audiobookId = audiobookId;
                chapterDoc.chapterNumber = nextChapter;
                await chapterDoc.save();

                //  Add notification queue (store recipient inside recordDetail)
                const queueExists = await NotificationQueue.findOne({
                    code: 'new-chapter-available',
                    'recordDetail.userId': uid,
                    'recordDetail.audiobookId': audiobookId,
                    'recordDetail.chapterNumber': nextChapter,
                    enabled: true,
                    createdAt: { $gte: dayStart, $lt: dayEnd }
                }).select('_id');

                if (!queueExists) {
                    const q = new NotificationQueue();
                    q.code = 'new-chapter-available';
                    q.recordDetail = {
                        userId: uid,
                        audiobookId,
                        chapterNumber: nextChapter
                    };
                    await q.save();
                }

                chaptersAddedForLaterReport.push({
                    userId: uid,
                    audiobookId,
                    chapterNumber: nextChapter
                });

                unlockedForUser = true;
                break;
            }

            if (!unlockedForUser) {
                //  No-op: user had no eligible "next chapter" today
            }
        }

        console.log('AddChapterToUser - Chapters added', chaptersAddedForLaterReport.length);
        if (chaptersAddedForLaterReport.length > 0) {
            console.log('AddChapterToUser - Detail', chaptersAddedForLaterReport);
        }

        const elapsedMs = Date.now() - processStartedAt;
        console.log('AddChapterToUser - PROCESS FINISHED', (new Date()), `(${elapsedMs} ms)`);

    } catch (ex) {
        console.error('AddChapterToUser - PROCESS ERROR', ex.message);
        logCronError({
            type: 'AddChapterToUser',
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
