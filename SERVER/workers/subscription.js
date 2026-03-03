async function getChapterAvailabilityDecision(userId, audiobookId, chapterNumber, options = {}) {

    const grantIfPossible = options.grantIfPossible !== false;

    //  Validate
    if (!userId || !audiobookId || !Number.isInteger(chapterNumber) || chapterNumber <= 0) {
        return {
            isAvailable: false,
            reasonCode: 'invalid-data',
            message: 'Invalid data'
        };
    }

    //  Validate audiobook and ownership
    const Audiobook = require('../models/audiobook');
    const ab = await Audiobook.findOne({
        _id: audiobookId,
        enabled: true,
        published: true,
        pipelineStatus: 'published'
    });
    if (!ab) {
        return {
            isAvailable: false,
            reasonCode: 'invalid-audiobook',
            message: 'Invalid audiobook'
        };
    }
    if (String(ab.userId) === String(userId)) {
        return {
            isAvailable: true,
            reasonCode: 'owner',
            message: 'Owner access'
        };
    }

    //  Chapter must exist in audiobook audio list
    const hasChapter = Array.isArray(ab.audioFiles) &&
        ab.audioFiles.some((c) => Number(c.chapter) === Number(chapterNumber) && !!c.url);
    if (!hasChapter) {
        return {
            isAvailable: false,
            reasonCode: 'invalid-chapter',
            message: 'Invalid chapter'
        };
    }

    //  Get active subscription
    const Subscription = require('../models/subscription');
    const sub = await Subscription.findOne({
        userId,
        status: 'active',
        enabled: true
    });
    if (!sub) {
        return {
            isAvailable: false,
            reasonCode: 'no-active-plan',
            message: 'You need an active subscription plan'
        };
    }

    //  UNLIMITED: any book, any chapter
    if (sub.plan === 'unlimited') {
        return {
            isAvailable: true,
            reasonCode: 'unlimited',
            message: 'Available'
        };
    }

    //  EXPLORER / READER:
    //  - monthly books cap (explorer=3, reader=6)
    //  - one new chapter per day is managed via user_chapter_available (cron grants next chapters)
    if (sub.plan !== 'explorer' && sub.plan !== 'reader') {
        return {
            isAvailable: false,
            reasonCode: 'invalid-plan',
            message: 'Invalid subscription plan'
        };
    }

    const UserChapterAvailable = require('../models/user_chapter_available');

    //  If chapter already unlocked, allow
    const available = await UserChapterAvailable.findOne({
        userId,
        audiobookId,
        chapterNumber,
        enabled: true
    });
    if (available) {
        return {
            isAvailable: true,
            reasonCode: 'already-unlocked',
            message: 'Available'
        };
    }

    //  If chapter not unlocked yet:
    //  - only chapter 1 can be granted immediately
    //  - chapters > 1 should be unlocked by cron, one per day
    if (chapterNumber !== 1) {
        return {
            isAvailable: false,
            reasonCode: 'daily-chapter-limit',
            message: 'Next chapter unlocks daily for this plan'
        };
    }

    const booksPerMonth = getBooksPerMonthLimit(sub.plan);
    if (booksPerMonth <= 0) {
        return {
            isAvailable: false,
            reasonCode: 'invalid-books-per-month',
            message: 'Invalid plan configuration'
        };
    }

    //  Current month bounds
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime();

    //  Distinct books this user has unlocked in current month
    const distinctBooks = await UserChapterAvailable.distinct('audiobookId', {
        userId,
        enabled: true,
        createdAt: { $gte: start, $lt: end }
    });
    const alreadyStartedThisBook = distinctBooks.some((id) => String(id) === String(audiobookId));

    //  Monthly cap only applies when starting a new audiobook
    if (!alreadyStartedThisBook && distinctBooks.length >= booksPerMonth) {
        return {
            isAvailable: false,
            reasonCode: 'monthly-book-limit',
            message: `You reached your monthly book limit (${booksPerMonth}) for this plan`
        };
    }

    //  Global daily gate for explorer/reader:
    //  only one new chapter unlock per user per day.
    const day = getDayBounds(Date.now());
    const unlockedToday = await UserChapterAvailable.findOne({
        userId,
        enabled: true,
        createdAt: { $gte: day.start, $lt: day.end }
    });
    if (unlockedToday) {
        return {
            isAvailable: false,
            reasonCode: 'daily-chapter-limit',
            message: 'You can unlock one new chapter per day with this plan'
        };
    }

    //  Grant and persist first chapter availability
    if (grantIfPossible) {
        await UserChapterAvailable.updateOne(
            {
                userId,
                audiobookId,
                chapterNumber
            },
            {
                $setOnInsert: {
                    userId,
                    audiobookId,
                    chapterNumber,
                    createdAt: Date.now()
                },
                $set: {
                    enabled: true,
                    updatedAt: Date.now()
                }
            },
            { upsert: true }
        );
    }

    return {
        isAvailable: true,
        reasonCode: grantIfPossible ? 'first-chapter-granted' : 'first-chapter-available',
        message: 'Available'
    };
}

async function isChapterAvailable(userId, audiobookId, chapterNumber) {
    const result = await getChapterAvailabilityDecision(userId, audiobookId, chapterNumber, { grantIfPossible: true });
    return result.isAvailable === true;
}

async function logAccessToChapter(userId, audiobookId, audioUrl, chapterNumber) {
    const AudiobookChapterLog = require('../models/audiobook_chapter_log');
    const log = await AudiobookChapterLog.findOne({
        userId,
        audiobookId,
        audioUrl,
        enabled: true
    });
    if (!log) {
        //  Add new log
        const doc = new AudiobookChapterLog();
        doc.userId = userId;
        doc.audiobookId = audiobookId;
        doc.chapterNumber = chapterNumber;
        await doc.save();
    } else {
        log.updatedAt = Date.now();
        await log.save();
    }
}

function getBooksPerMonthLimit(plan) {
    if (plan === 'explorer') return 3;
    if (plan === 'reader') return 6;
    return 0;
}

function getDayBounds(ts) {
    const d = new Date(ts);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0).getTime();
    return { start, end };
}

module.exports = {
    getChapterAvailabilityDecision,
    isChapterAvailable,
    logAccessToChapter
};
