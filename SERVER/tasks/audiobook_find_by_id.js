const { Audiobook, sanitizeAudiobook, unexpectedError } = require('./audiobook_find_shared');

async function run(data, req, res) {
    try {
        const audiobookId = data?.audiobookId;
        if (!audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            });
        }

        const record = await Audiobook.findOne({
            _id: audiobookId,
            enabled: true
        });

        const audiobooks = record ? [sanitizeAudiobook(record)] : [];

        return res.status(200).json({
            success: true,
            audiobooks,
            hasMore: false
        });
    } catch (ex) {
        return unexpectedError(res, ex, __filename);
    }
}

module.exports = {
    run
};

