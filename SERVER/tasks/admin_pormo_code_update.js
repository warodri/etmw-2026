const PromoCode = require('../models/promo_codes');

async function run(data, req, res) {
    try {
        const {
            id,
            code,
            partnerName,
            partnerDescription,
            website,
            linkToCode,
            enabled
        } = data;

        const promoCode = await PromoCode.findOne({
            _id: id,
            enabled: true
        });
        if (promoCode) {
            promoCode.code = code;
            promoCode.partnerName = partnerName;
            promoCode.partnerDescription = partnerDescription;
            promoCode.website = website;
            promoCode.linkToCode = linkToCode;
            promoCode.enabled = enabled;
            promoCode.updatedAt = Date.now();
            await promoCode.save();
        }

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