const PromoCode = require('../models/promo_codes');

async function run(data, req, res) {
    try {

        const records = await PromoCode.find({ enabled: true });

        return res.status(200).json({
            success: true,
            data: records
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