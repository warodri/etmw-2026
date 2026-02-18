const { informAdmins } = require('../workers/email');

async function run(data, req, res) {
    try {
        const {
            audiobookId,
        } = data;

        const userId = req.userId || null;

        if (!userId || !audiobookId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        //  Find the audiobook
        const AudioBook = require('../models/audiobook');
        const doc = await AudioBook.findOne({
            _id: audiobookId,
            enabled: true
        })
        
        if (doc && doc.paymentCompleted) {

            const config = require('../config')
            CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;

            //  Inform Admins all okay
            const SUBJECT = 'ETMW - Libro fue pagado!';
            const BODY = `
                <h5><b>Libro fue pagado!</b></h5>
                Titulo: <b>${doc.title}</b> <br>
                Descripcion: <b>${doc.description}</b> <br>
                <hr />
                Procesa la conversion desde aqui: ${CLIENT}/#/app/admin
            `
            informAdmins(SUBJECT, BODY);

            //  Resopnd back
            res.json({
                success: true,
                paymentCompleted: true
            });
        } else {

            //  Inform back about incomplete payment            
            res.json({
                success: false,
            });
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