const PromoCode = require('../models/promo_codes');

async function run(data, req, res) {
    try {
        const {
            code,
            partnerName,
            partnerDescription,
            website,
            linkToCode,
            enabled
        } = data;

        const promoCode = new PromoCode({
            code,
            partnerName,
            partnerDescription,
            website,
            linkToCode,
            enabled
        });

        await promoCode.save();

        return res.status(200).json({
            success: true,
            promoCode
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