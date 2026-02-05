const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(200).json({
                success: false,
                message: 'Category not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
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