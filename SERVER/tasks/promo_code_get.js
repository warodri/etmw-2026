const PromoCode = require('../models/promo_codes');

async function run(data, req, res) {
    try {

        const records = await PromoCode.find({ enabled: true });

        const a = [];
        for (let item of records) {
            a.push({
                partnerName: item.partnerName,
                partnerDescription: item.partnerDescription,
                website: item.website,
                language: item.language,
                linkToCode: item.linkToCode
            })
        }

        return res.status(200).json({
            success: true,
            data: a
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