async function run(data, req, res) {
    try {
        const payload = (req.body && req.body.data) ? req.body.data : (req.body || data || {});
        const {
            language,
            locale,
            forceRefresh
        } = payload;

        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        const elevenLabs = require('../workers/eleven_labs_utils');
        const normalizedLocale = locale || null;
        const normalizedLanguage = language || (normalizedLocale ? String(normalizedLocale).split('-')[0] : null);

        const voices = await elevenLabs.getVoicesByTier({
            language: normalizedLanguage,
            locale: normalizedLocale,
            sort: 'trending',
            category: 'high_quality',
            pageSize: 100
        }, !!forceRefresh);

        res.status(200).json({
            success: true,
            voices
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

module.exports = { run }
