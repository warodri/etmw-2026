async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const Author = require('../models/author')
        
        const alias = await Author.find({
            userId,
            isAlias: true,
            enabled: true
        })

        return res.status(200).json({
            success: true,
            alias
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