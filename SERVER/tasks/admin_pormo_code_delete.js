const PromoCode = require('../models/promo_codes');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;

        const promoCode = await PromoCode.findOne({
            _id: id,
            enabled: true
        });
        if (promoCode) {
            promoCode.enabled = false;
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