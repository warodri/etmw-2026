const { informAdmins } = require('../workers/email');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
            totalPages,
        } = req.body;

        const AudioBook = require('../models/audiobook');
        
        const audiobook = await AudioBook.findOne({ 
            _id: audiobookId,
            enabled: true 
        })

        if (!audiobook) {
            //  Respond
            return res.status(200).json({
                success: false,
            })
        } else {

            audiobook.totalPages = totalPages;
            audiobook.updatedAt = Date.now();
            await audiobook.save();
            
            //  Respond
            return res.status(200).json({
                success: true,
            })
        }

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