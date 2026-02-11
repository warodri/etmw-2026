
/**
 * What it now supports:

    - audiobookId (string) = direct lookup (single record).
    - query (string) = text search across title, authorName, description, voiceName, and categories.
    - authorIds (string or array) filter.
    - categories (string or array) filter.
    - myAudiobooks (boolean) = using req.userId → author → audiobooks.
    - published (boolean), 
    - pipelineStatus (string), 
    - limit (number), 
    - skip (number), 
    - latest (boolean)
 */
async function run(data, req, res) {
    try {
        const {
            audiobookId,
            query,
            authorIds,
            categories,
            latest,
            myAudiobooks,
            published,
            pipelineStatus,
            limit = 50,
            skip = 0
        } = data;

        //  Models
        const Audiobook = require('../models/audiobook');
        const Author = require('../models/author');
        
        //  If user is logged in, this value is populated with the _id of the "User" model
        const userId = req.userId || null;

        /**
         * Array to return the audiobooks found.
         * - Return only if the record has enabled : true
         * - For the field "audioFiles":
         * audioFiles: [{
                chapter: Number,
                url: String,
                durationSec: Number
            }] don't return "url" because that's for later, when the user is listening.
         */
        const audiobooks = [];

        const sanitizeAudiobook = (doc) => {
            if (!doc) return doc;
            const obj = doc.toObject ? doc.toObject() : doc;
            const audioFiles = Array.isArray(obj.audioFiles) ? obj.audioFiles : [];
            return {
                ...obj,
                audioFiles: audioFiles.map((file) => ({
                    chapter: file.chapter,
                    durationSec: file.durationSec
                }))
            };
        };

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        /**
         * TODO: I need to build the query, perform the search and return the array.
         */
        if (audiobookId) {
            const record = await Audiobook.findOne({
                _id: audiobookId,
                enabled: true
            });
            if (record) {
                audiobooks.push(sanitizeAudiobook(record));
            }
        } else {
            const mongoQuery = {
                enabled: true
            };

            if (published !== undefined) {
                mongoQuery.published = published;
            }
            if (pipelineStatus) {
                mongoQuery.pipelineStatus = pipelineStatus;
            }

            if (authorIds) {
                const authorIdsList = Array.isArray(authorIds) ? authorIds : [authorIds];
                if (authorIdsList.length > 0) {
                    mongoQuery.authorId = { $in: authorIdsList };
                }
            }

            if (myAudiobooks) {
                if (!userId) {
                    return res.status(200).json({
                        success: false,
                        message: 'invalid data'
                    })
                }
                const author = await Author.findOne({
                    userId,
                    enabled: true
                });
                if (!author) {
                    return res.status(200).json({
                        success: true,
                        audiobooks: []
                    })
                }
                if (mongoQuery.authorId && mongoQuery.authorId.$in) {
                    mongoQuery.authorId.$in = mongoQuery.authorId.$in.filter(
                        (id) => String(id) === String(author._id)
                    );
                } else {
                    mongoQuery.authorId = author._id;
                }
            }

            if (categories) {
                const categoriesList = Array.isArray(categories) ? categories : [categories];
                if (categoriesList.length > 0) {
                    mongoQuery.categories = { $in: categoriesList };
                }
            }

            if (query && String(query).trim().length > 0) {
                const q = new RegExp(escapeRegex(String(query).trim()), 'i');
                mongoQuery.$or = [
                    { title: q },
                    { authorName: q },
                    { description: q },
                    { voiceName: q },
                    { categories: { $elemMatch: { $regex: q } } }
                ];
            }

            const sortQuery = latest ? { createdAt: -1 } : { createdAt: -1 };

            const records = await Audiobook.find(mongoQuery)
                .sort(sortQuery)
                .limit(parseInt(limit))
                .skip(parseInt(skip));

            records.forEach((record) => audiobooks.push(sanitizeAudiobook(record)));
        }

        /**
         * Respond to user
         */
        return res.status(200).json({
            success: true,
            audiobooks
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
