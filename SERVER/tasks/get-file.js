const fs = require('fs');
const path = require('path');

function sanitizeRequestedId(rawId) {
    const decoded = decodeURIComponent(String(rawId || ''));
    // normalize slashes and drop query-style leading slash
    let safe = decoded.replace(/\\/g, '/').replace(/^\/+/, '');
    // prevent path traversal
    safe = safe.replace(/\.\.(\/|\\)/g, '');
    return safe.trim();
}

async function run(req, res) {
    try {
        const rawId = req.params.id || req.query.id; // supports /file/:id and /file?id=...
        const id = sanitizeRequestedId(rawId);
        const mimeBase64 = req.params.mimetype;
        let mimetype = '';
        if (mimeBase64) {
            try {
                mimetype = Buffer.from(mimeBase64, 'base64').toString('utf8');
            } catch {
                mimetype = '';
            }
        }

        if (!id) {
            return res.send("Missing data");
        }

        // If starts with "audiobooks/" then it's asking for a story/chapter asset
        const isStory = id.startsWith('audiobooks/');
        
        // Absolute path to "uploads" or "audiobooks" folder
        let filePath = path.join(__dirname, '..', 'uploads', id);
        if (isStory) {
            const relativeInAudiobooks = id.replace(/^audiobooks\/+/, '');
            filePath = path.join(__dirname, '..', 'audiobooks', relativeInAudiobooks);
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

        // MIME type is optional in URL. If absent, infer from file extension.
        if (mimetype) {
            res.setHeader("Content-Type", mimetype);
        } else {
            res.type(filePath);
        }

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
