const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
            id,
            name,
            parentId,
            enabled
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (parentId !== undefined) updateData.parentId = parentId;
        if (enabled !== undefined) updateData.enabled = enabled;

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (!category) {
            return res.status(200).json({
                success: false,
                message: 'Category not found'
            })
        }

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