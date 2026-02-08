const Author = require('../models/author');

async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;

        let standardPricing = [{
            label: 'Up to 100 pages',
            latam: 5,
            us: 9,
            uk: 9,
            global: 9,
        }, {
            label: '101-250 pages',
            latam: 10,
            us: 19,
            uk: 19,
            global: 19
        }, {
            label: '251-500 pages',
            latam: 18,
            us: 29,
            uk: 29,
            global: 29,
        }, {
            label: '500-700 pages',
            latam: 25,
            us: 39,
            uk: 39,
            global: 39,
        }]

        let translation = {
            useFixedPrice: true,
            PER_WORD: {
                latam: 0.002,
                us: 0.002,
                uk: 0.002,
                global: 0.002,
            }, 
            FIXED_PRICE: {
                latam: 5,
                us: 15,
                uk: 15,
                global: 15,
            }
        }

        let premiumVoiceCost = {
            latam: 3,
            us: 9,
            uk: 9,
            global: 9,
        }

        let voiceExpression = {
            latam: 3,
            us: 9,
            uk: 9,
            global: 9,
        }

        let sendBookAddress = {
            UK: {
                name: 'ETMW Publishing',
                address: '55 Kings Wood Park',
                postcode: 'CM16 6FA Epping, Essex',
                country: 'United Kingdom'
            }, 
            ARGENTINA: {
                name: 'ETMW Publishing',
                address: 'Colon 210',
                postcode: '3100 Paran, Entre Rios',
                country: 'Argentina'
            }
        }

        return res.status(200).json({
            success: true,
            standardPricing,
            translation,
            premiumVoiceCost,
            voiceExpression,
            sendBookAddress
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