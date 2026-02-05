const Category = require('../models/etmw2026_categories');

module.exports = {

    async getAllCategories() {
        return Category.find({ enabled: true });
    },

    async getRootCategories() {
        return Category.find({ parentId: null, enabled: true });
    },

    async getSubcategories(parentId) {
        return Category.find({ parentId, enabled: true });
    }

};
