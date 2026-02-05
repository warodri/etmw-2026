const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
            name,
            parentId
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const category = new Category({
            name,
            parentId,
            enabled: true
        });

        await category.save();

        return res.status(200).json({
            success: true,
            data: category
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