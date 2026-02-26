async function run(data, req, res) {
    try {
        const {
            authorId,
            penName,
            bio,
            bookTaste,
        } = req.body;

        const userId = req.userId || null;
        const file = req.file;

        if (!userId) {
            return res.status(200).json({
                success: false,
                message: 'Invalid data'
            })
        }

        const Author = require('../models/author')
        const UserModel = require('../models/user')

        const normalizeBookTaste = (rawBookTaste) => {
            if (Array.isArray(rawBookTaste)) {
                return rawBookTaste.map(item => String(item || '').trim()).filter(Boolean);
            }
            if (typeof rawBookTaste === 'string') {
                const trimmed = rawBookTaste.trim();
                if (!trimmed) return [];
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.map(item => String(item || '').trim()).filter(Boolean);
                    }
                } catch (ex) {
                    // fallback to comma-delimited parsing
                }
                return trimmed.split(',').map(item => item.trim()).filter(Boolean);
            }
            return [];
        };

        const normalizedBookTaste = normalizeBookTaste(bookTaste);
        let savedAlias = null;
        
        if (authorId) {
            //
            //  Wants to modify an author alias
            //
            const alias = await Author.findOne({
                _id: authorId,
                userId,
                isAlias: true,
                enabled: true
            })
            if (!alias) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid alias'
                })
            }
            //  Update its details
            if (file) alias.profilePicture = file;
            if (normalizedBookTaste.length > 0) alias.bookTaste = normalizedBookTaste;
            if (penName) alias.penName = penName;
            if (bio) alias.bio = bio;
            alias.updatedAt = Date.now();
            await alias.save();
            savedAlias = alias;

        } else {
            //
            //  Wants to add a new alias
            //
            const doc = new Author();
            //  
            //  Find the user
            //
            const user = await UserModel.findOne({
                _id: userId,
                enabled: true
            })
            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid user'
                })
            }
            doc.userId = userId;
            doc.isAlias = true;
            doc.profilePicture = file;
            doc.bookTaste = normalizedBookTaste;
            doc.penName = penName;
            doc.bio = bio;
            doc.languages = user.languages;
            doc.categories = [];
            doc.country = user.country;
            doc.isVerified = false;
            savedAlias = await doc.save();
        }

        return res.status(200).json({
            success: true,
            alias: savedAlias
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
