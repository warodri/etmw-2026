const { informAdmins } = require('../workers/email');

async function run(data, req, res) {
    try {
        const {
            uploadMethod,
            config,
            referralCode,
            totalPrice,
            basePrice,
            hasReferral,
        } = req.body;

        const file = req.file || null;
        const userId = req.userId || null;

        if (!userId || !uploadMethod || !config || !basePrice) {
            return res.status(200).json({
                success: false,
                message: 'invalid data'
            })
        }

        const c = JSON.parse(config);
        const {
            sourceLanguage,
            targetLanguage,
            voiceId,
            voiceName,
            voiceGender,
            voiceUrl,
            useExpression,
            speechRate,
            stability,
            clarity,
            title,
            authorName,
            description,
            categories,
        } = c


        //  Find this user
        const User = require('../models/user');
        const u = await User.findOne({
            _id: userId,
            enabled: true
        })
        if (!u) {
            return res.status(200).json({
                success: false,
                message: 'invalid user'
            })
        }

        //  Define this user as an author now
        u.isAuthor = true;
        await u.save();

        //  Create author if doesn't exist
        const Author = require('../models/author');
        let a = await Author.findOne({
            userId,
            enabled: true
        })
        if (!a) {
            //  Create new author
            const doc = new Author();
            doc.userId = userId;
            doc.penName = authorName;
            doc.bio = '';
            doc.languages = u.languages;
            doc.country = u.country;
            doc.totalAudiobooks = 1;
            a = await doc.save();
        }
        if (!a) {
            return res.status(200).json({
                success: false,
                message: 'invalid author'
            })
        }

        //  Add audiobook
        const AudioBook = require('../models/audiobook');
        const ab = new AudioBook();
        ab.file = file;
        ab.uploadMethod = uploadMethod;
        ab.referralCode = referralCode;
        ab.totalPrice = totalPrice;
        ab.basePrice = basePrice;
        ab.hasReferral = hasReferral;
        
        ab.authorId = a._id;
        ab.sourceLanguage = sourceLanguage;
        ab.targetLanguage = targetLanguage;
        
        ab.voiceId = voiceId;
        ab.voiceName = voiceName;
        ab.voiceGender = voiceGender;
        ab.voiceUrl = voiceUrl;

        ab.useExpression = useExpression;
        ab.speechRate = speechRate;
        ab.stability = stability;
        ab.clarity = clarity;
        ab.title = title;
        ab.authorName = authorName;
        ab.description = description;
        ab.categories = categories;
        
        ab.pipelineStatus = 'uploaded';
        ab.totalPages = 0;
        ab.totalAudioDurationSec = 0;
        ab.audioFiles = [];
        ab.published = false;
        ab.publishedAt = Date.now();
        const newAudiobook = await ab.save();

        //  Tell Admins
        const mainConfig = require('../config');
        const CLIENT = mainConfig.dev ? mainConfig.CLIENT.local : mainConfig.CLIENT.remote;
        const SUBJECT = 'ETMW - Un usuario acaba de subir un libro';
        const BODY = `
            <h5><b>Todavia no esta pagado</b></h5>
            Titulo: <b>${title}</b> <br>
            Descripcion: <b>${description}</b> <br>
            <hr />
            Accede aqui: ${CLIENT}/#/app/admin
        `
        informAdmins(SUBJECT, BODY);

        //  Respond
        return res.status(200).json({
            success: true,
            audiobook: newAudiobook
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