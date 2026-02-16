
async function isChapterAvailable(userId, audiobookId, chapterNumber) {

    //  Validate
    if (!userId || !audiobookId || !chapterNumber) return false;

    //  If this user is the owner, then return true
    const Audiobook = require('../models/audiobook');
    const ab = await Audiobook.findOne({
        _id: audiobookId,
        enabled: true
    })
    if (!ab) return false;
    if (ab.userId == userId) return true;

    //  Get this user's subscription
    const Subscription = require('../models/subscription');
    const sub = await Subscription.findOne({
        userId,
        status: 'active',
        enabled: true
    })
    if (!sub) {
        return false;
    }

    // UNLIMITED: any book any chapter 
    if (sub.plan == 'unlimited') return true;

    //  EXPLORER: 3 books per month / 1 chapter per day
    //  READER: 6 books per month / 1 chapter per day
    if (sub.plan == 'explorer' || sub.plan == 'reader') {
        
        //  Search if the chapter was added by our CRON running daily
        const UserChapterAvailable = require('../models/user_chapter_available');        
        const available = await UserChapterAvailable.findOne({
            userId,
            audiobookId,
            chapterNumber: chapterNumber,
            enabled: true
        })
        if (!available) {
            //  Only allow auto-adding the first chapter
            if (chapterNumber !== 1) {
                return false;
            }

            //  Validate monthly limits
            const booksPerMonth = sub.booksPerMonth || 0;
            if (booksPerMonth <= 0) {
                return false;
            }

            const monthStart = sub.monthStart || (new Date().getMonth() + 1);
            const yearStart = sub.yearStart || (new Date().getFullYear());
            const start = new Date(yearStart, monthStart - 1, 1, 0, 0, 0, 0).getTime();
            const end = new Date(yearStart, monthStart, 1, 0, 0, 0, 0).getTime();

            const distinctBooks = await UserChapterAvailable.distinct('audiobookId', {
                userId,
                enabled: true,
                createdAt: { $gte: start, $lt: end }
            });

            //  If user already reached the monthly book limit, deny
            if (distinctBooks.length >= booksPerMonth) {
                return false;
            }

            //  Add chapter availability now
            const doc = new UserChapterAvailable();
            doc.userId = userId;
            doc.audiobookId = audiobookId;
            doc.chapterNumber = chapterNumber;
            await doc.save();
            
            return true;

        } else {
            return true;
        }

    } else {
        return false;
    }
}

async function logAccessToChapter(userId, audiobookId, audioUrl, chapterNumber) {
    const AudiobookChapterLog = require('../models/audiobook_chapter_log');
    const log = await AudiobookChapterLog.findOne({
        userId,
        audiobookId,
        audioUrl,
        enabled: true
    })
    if (!log) {
        //  Add new log
        const doc = new AudiobookChapterLog();
        doc.userId = userId;
        doc.audiobookId = audiobookId;
        doc.chapterNumber = chapterNumber;
        await doc.save();
    } else {
        log.updatedAt = Date.now();
        await doc.save();
    }
}

module.exports = {
    isChapterAvailable,
    logAccessToChapter
}
