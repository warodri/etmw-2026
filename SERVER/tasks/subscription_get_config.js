
async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;

        const config = require('../config');       
        
        const test = config.STRIPE.test;

        //  Return
        return res.status(200).json({
            success: true,
            config: test ? config.STRIPE.PRODUCTS.test : config.STRIPE.PRODUCTS.prod
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