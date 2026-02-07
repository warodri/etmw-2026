
async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;

        //  Validate
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid user'
            })
        }

        const elevenLabs = require('../workers/eleven_labs_utils');
        const voices = await elevenLabs.getVoicesByTier();
        
        //  Finally respond to client
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

module.exports = {
    run
}