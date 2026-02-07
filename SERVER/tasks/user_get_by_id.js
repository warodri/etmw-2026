const User = require('../models/user');

async function run(data, req, res) {
    try {
        const {
            id
        } = data;

        const user = await User.findById(id);

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            user
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