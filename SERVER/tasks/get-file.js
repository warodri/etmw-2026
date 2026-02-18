const fs = require('fs');
const path = require('path');

async function run(req, res) {
    try {
        const id = req.params.id;    // e.g. "1764835843945.png" or "audiobooks/story/images/999999/1764835843945.png" or "audiobooks/story/99999999/story_1_0.mp3"
        const mimeBase64 = req.params.mimetype;  
        const mimetype = Buffer.from(mimeBase64, 'base64').toString('utf8');

        if (!id || !mimetype) {
            return res.send("Missing data");
        }

        //  If contains "audiobooks/" then it's asking for an image or an audio from a story
        const isStory = (id.indexOf('audiobooks/') > -1);
        
        // Absolute path to "uploads" or "audiobooks" folder
        let filePath = path.join(__dirname, '..', 'uploads', id);
        if (isStory) {
            filePath = path.join(__dirname, '..', 'audiobooks', id);
        }

        /**
         * IMPORTANT FOR STORIES
         * If the user requests an audiobook chapter
         * then I must also validate the user can actually
         * listen the MP3 according to their paying plan.
         */

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