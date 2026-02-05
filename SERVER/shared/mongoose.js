const config = require('../config');

const initMongoose = (callback) => {
    const user = config.MONGO.username;
    const password = config.MONGO.password;
    const mongoose = require("mongoose");
    const uri = 'mongodb+srv://' + user + ':' + password + '@cluster0.nadno.mongodb.net/etmw?retryWrites=true&w=majority';
    mongoose.connect(uri, {
    });
    const connection = mongoose.connection;
    connection.once("open", function () {
        console.log("MongoDB database connection established successfully");
        callback();
    });
}

// Get the native MongoDB db object
const getDb = () => {
    const mongoose = require("mongoose");
    return mongoose.connection.db;
}

module.exports = { initMongoose, getDb }
