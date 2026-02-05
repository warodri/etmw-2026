const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema({

    name: {
        type: String,
        index: true,
        unique: true
    },

    parentId: {
        type: Schema.Types.ObjectId,
        ref: "etmw2026_categories",
        default: null
    },

    enabled: {
        type: Boolean,
        default: true
    }

});

module.exports = mongoose.model("etmw2026_categories", model);
