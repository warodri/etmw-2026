const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
        } = data;

        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const categories = await Category.find({
            enabled: true
        }).populate('parentId');

        return res.status(200).json({
            success: true,
            categories
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