const fs = require('fs');
const path = require('path');

async function run(req, res) {
    try {
        const id = req.params.id;            // e.g. "1764835843945.png"
        const mimeBase64 = req.params.mimetype;  
        const mimetype = Buffer.from(mimeBase64, 'base64').toString('utf8');

        if (!id || !mimetype) {
            return res.send("Missing data");
        }

        // Absolute path to uploads folder
        const filePath = path.join(__dirname, '..', 'uploads', id);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(200).json({
                success: false,
                message: "File does not exist"
            });
        }

        // Load file into memory
        const fileContent = fs.readFileSync(filePath);

        // Set MIME type (fallback to octet-stream)
        res.setHeader("Content-Type", mimetype || "application/octet-stream");

        // Optional: inline or download?
        // res.setHeader("Content-Disposition", "inline");  // show in browser
        // res.setHeader("Content-Disposition", `attachment; filename="${id}"`);

        return res.status(200).send(fileContent);

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