const Category = require('../models/categories');

async function run(data, req, res) {
    try {
        const {
            name,
            parentId,
            enabled,
            limit = 50,
            skip = 0
        } = data;
        const userId = req.userId || null;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (parentId !== undefined) query.parentId = parentId;
        if (enabled !== undefined) query.enabled = enabled;

        const categories = await Category.find(query)
            .populate('parentId')
            .sort({ name: 1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Category.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: categories,
            total
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