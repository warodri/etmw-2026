const Audiobook = require('../models/audiobook');

async function run(data, req, res) {
    try {
        const {
            id,
            title,
            description,
            language,
            accent,
            categories,
            sourceType,
            pipelineStatus,
            totalPages,
            totalAudioDurationSec,
            audioFiles,
            published,
            publishedAt
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = { updatedAt: Date.now() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (language !== undefined) updateData.language = language;
        if (accent !== undefined) updateData.accent = accent;
        if (categories !== undefined) updateData.categories = categories;
        if (sourceType !== undefined) updateData.sourceType = sourceType;
        if (pipelineStatus !== undefined) updateData.pipelineStatus = pipelineStatus;
        if (totalPages !== undefined) updateData.totalPages = totalPages;
        if (totalAudioDurationSec !== undefined) updateData.totalAudioDurationSec = totalAudioDurationSec;
        if (audioFiles !== undefined) updateData.audioFiles = audioFiles;
        if (published !== undefined) updateData.published = published;
        if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

        const audiobook = await Audiobook.findByIdAndUpdate(id, updateData, { new: true });

        if (!audiobook) {
            return res.status(200).json({
                success: false,
                message: 'Audiobook not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: audiobook
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