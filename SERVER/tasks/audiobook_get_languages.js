const { Audiobook, unexpectedError } = require('./audiobook_find_shared');

function parseBaseLanguage(value) {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim().toLowerCase();
    if (!raw) return null;

    const base = raw.split('-')[0].trim();
    if (!/^[a-z]{2,3}$/.test(base)) return null;
    return base;
}

async function run(data, req, res) {
    try {
        const rows = await Audiobook.aggregate([
            {
                $match: {
                    enabled: true,
                    published: true
                }
            },
            {
                $project: {
                    language: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ['$targetLanguage', null] },
                                    { $ne: ['$targetLanguage', ''] }
                                ]
                            },
                            '$targetLanguage',
                            '$sourceLanguage'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$language',
                    count: { $sum: 1 }
                }
            }
        ]);

        const countByLanguage = new Map();
        rows.forEach((row) => {
            const base = parseBaseLanguage(row?._id);
            if (!base) return;
            const current = countByLanguage.get(base) || 0;
            countByLanguage.set(base, current + Number(row?.count || 0));
        });

        const languages = Array.from(countByLanguage.entries())
            .map(([code, count]) => ({ code, count }))
            .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));

        return res.status(200).json({
            success: true,
            languages
        });
    } catch (ex) {
        return unexpectedError(res, ex, __filename);
    }
}

module.exports = {
    run
};
