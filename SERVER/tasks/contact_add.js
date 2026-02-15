const Contact = require('../models/contact');

async function run(data, req, res) {
    try {
        const {
            sector,
            name,
            email,
            userType,
            subject,
            message,
            issueType,
            platform,
            device,
            appVersion,
            audiobookId,
            chapterNumber,
            paymentId
        } = data;

        const userId = req.userId || null;
        if (!name || !email || !subject || !message) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const doc = new Contact();
        if (userId) doc.userId = userId;
        doc.sector = sector || 'website';
        doc.name = name;
        doc.email = email;
        doc.userType = userType || '';
        doc.subject = subject;
        doc.message = message;
        doc.issueType = issueType || '';
        doc.platform = platform || '';
        doc.device = device || '';
        doc.appVersion = appVersion || '';
        doc.audiobookId = audiobookId || '';
        doc.chapterNumber = chapterNumber || '';
        doc.paymentId = paymentId || '';
        doc.createdAt = Date.now();
        doc.updatedAt = Date.now();
        await doc.save();


        return res.status(200).json({
            success: true,
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
