const { informAdmins } = require('../workers/email');

async function run(data, req, res) {
    try {
        const {
        } = req.body;

        const AudioBook = require('../models/audiobook');
        
        const audiobooks = await AudioBook.find({ 
            enabled: true 
        })
        .sort({ 
            paymentCompleted: -1, 
            createdAt: -1 
        })
        .lean();

        //  Respond
        return res.status(200).json({
            success: true,
            audiobooks
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