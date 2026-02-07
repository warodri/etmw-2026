
async function run(data, req, res) {
    try {
        const {
        } = req.body;

        const file = req.file;
        const userId = req.userId;

        //  Validate
        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Missing data'
            })
        }
        
        //  Finally respond to client
        res.status(200).json({
            success: true,
            file
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