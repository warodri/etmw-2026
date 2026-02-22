const config = require('../config');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: config.OPEN_AI.API_KEY });

const MAX_DAILY_SUMMARIES = 5;

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

function getDayKey(timestamp = Date.now()) {
    const d = new Date(timestamp);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return Number(`${year}${month}${day}`);
}

function getSenderName(value) {
    if (!value) return 'Someone';
    if (typeof value === 'string') return 'Someone';
    const first = String(value.firstName || '').trim();
    const last = String(value.lastName || '').trim();
    const full = `${first} ${last}`.trim();
    if (full) return full;
    if (value.email) return String(value.email).split('@')[0];
    return 'Someone';
}

function buildFallbackSummary(lines) {
    if (!lines.length) return 'No new unread messages.';
    const joined = lines.slice(0, 3).join(' ');
    return `You have new messages. ${joined}`;
}

async function generateSummaryWithOpenAI(unreadCount, lines) {
    const systemPrompt = `You summarize inbox messages for users.
- Keep it short (2-4 sentences).
- Mention only the most relevant themes/questions.
- Friendly, neutral tone.
- Do not invent facts.
- If messages are repetitive, group them naturally.
- Return plain text only.`;

    const userPrompt = [
        `Unread messages count: ${unreadCount}`,
        'Unread message snippets:',
        ...lines.map((line, idx) => `${idx + 1}. ${line}`)
    ].join('\n');

    const completion = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0.4,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    });

    return String(completion?.choices?.[0]?.message?.content || '').trim();
}

async function run(data, req, res) {
    try {
        const payload = parsePayload(req, data);
        const forceRefresh = !!payload.forceRefresh;

        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            });
        }

        const Comment = require('../models/comment');
        const CommentAiSummary = require('../models/comments_ai_summary');

        const [summaryDoc, unreadMessages] = await Promise.all([
            CommentAiSummary.findOne({ userId }),
            Comment.find({
                targetType: 'message',
                targetId: userId,
                isRead: false
            })
                .populate('userId', '_id firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(50)
        ]);

        const unreadCount = unreadMessages.length;
        const now = Date.now();
        const todayKey = getDayKey(now);

        const doc = summaryDoc || new CommentAiSummary({ userId });
        if (doc.lastProcessingDay !== todayKey) {
            doc.lastProcessingDay = todayKey;
            doc.totalProcessingPerDay = 0;
        }

        // If nothing changed and not forced, return cached summary without consuming daily quota.
        if (!forceRefresh && doc.lastUnreadCount === unreadCount && doc.lastSummary) {
            return res.status(200).json({
                success: true,
                summary: doc.lastSummary,
                fromCache: true,
                unreadCount,
                totalProcessingPerDay: doc.totalProcessingPerDay || 0,
                remainingToday: Math.max(0, MAX_DAILY_SUMMARIES - (doc.totalProcessingPerDay || 0))
            });
        }

        // No unread messages -> static summary, no AI call, no quota usage.
        if (unreadCount === 0) {
            doc.lastUnreadCount = 0;
            doc.lastSummary = 'You are all caught up. No unread messages.';
            doc.lastProcessingTime = now;
            doc.updatedAt = now;
            await doc.save();

            return res.status(200).json({
                success: true,
                summary: doc.lastSummary,
                fromCache: false,
                unreadCount: 0,
                totalProcessingPerDay: doc.totalProcessingPerDay || 0,
                remainingToday: Math.max(0, MAX_DAILY_SUMMARIES - (doc.totalProcessingPerDay || 0))
            });
        }

        const totalToday = Number(doc.totalProcessingPerDay || 0);
        if (totalToday >= MAX_DAILY_SUMMARIES) {
            return res.status(200).json({
                success: false,
                limited: true,
                message: 'Daily AI summary limit reached (5 per day).',
                summary: doc.lastSummary || '',
                unreadCount,
                totalProcessingPerDay: totalToday,
                remainingToday: 0
            });
        }

        const lines = unreadMessages.map((item) => {
            const sender = getSenderName(item.userId);
            const text = String(item.text || '').replace(/\s+/g, ' ').trim();
            return text ? `${sender}: ${text}` : `${sender}: Sent a non-text message.`;
        });

        let summary = '';
        try {
            summary = await generateSummaryWithOpenAI(unreadCount, lines);
        } catch (ex) {
            console.log('OpenAI summary generation failed. Using fallback summary.');
            console.log(ex.message);
        }
        if (!summary) {
            summary = buildFallbackSummary(lines);
        }

        doc.lastUnreadCount = unreadCount;
        doc.lastSummary = summary;
        doc.lastProcessingTime = now;
        doc.totalProcessingPerDay = totalToday + 1;
        doc.updatedAt = now;
        await doc.save();

        return res.status(200).json({
            success: true,
            summary,
            fromCache: false,
            unreadCount,
            totalProcessingPerDay: doc.totalProcessingPerDay || 0,
            remainingToday: Math.max(0, MAX_DAILY_SUMMARIES - (doc.totalProcessingPerDay || 0))
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
