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

        const Audiobook = require('../models/audiobook');
        const categoryCounts = await Audiobook.aggregate([
            { $match: { enabled: true } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);

        const countsByName = new Map(
            categoryCounts.map((item) => [String(item._id), item.count])
        );

        const categoriesWithCounts = categories.map((cat) => {
            const obj = cat.toObject ? cat.toObject() : cat;
            return {
                ...obj,
                count: countsByName.get(String(obj.name)) || 0
            };
        });

        return res.status(200).json({
            success: true,
            categories: categoriesWithCounts
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
