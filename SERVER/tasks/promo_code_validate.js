const PromoCode = require('../models/promo_codes');
const PromoCodeUsage = require('../models/promo_code_usage');

async function run(data, req, res) {
    try {
        const {
            promoCode
        } = data;

        const userId = req.userId || null;

        if (!userId || !promoCode) {
            return res.status(200).json({
                success: false,
                message: 'Invalid code'
            })
        }

        const record = await PromoCode.findOne({
            code: promoCode,
             enabled: true 
        });

        if (!record) {
            return res.status(200).json({
                success: false
            })
        } else {
            //  Log code usage
            const doc = new PromoCodeUsage();
            doc.code = promoCode;
            doc.partnerName = record.partnerName;
            doc.userId = userId;
            await doc.save();
            //  Return success
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