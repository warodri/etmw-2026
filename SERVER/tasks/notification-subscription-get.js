const jwt = require('jsonwebtoken');
const config = require('../config')

async function run(data, req, res) {
    try {
        const {
            token
        } = data

        if (!token) {
            return res.status(200).json({
                success: false,
                message: 'Invalid token'
            })
        }

        //  Decode the token to get the userId
        const info = decodeToken(token);
        if (!info || !info.userId) {
            return res.status(200).json({
                success: false,
                message: 'Unable to read user info'
            })
        }

        //  Return the payload
        const NotificationSubscription = require('../models/notification-subscription');
        const doc = await NotificationSubscription.findOne({
            userId: info.userId,
            enabled: true
        })
        if (!doc) {
            //  CREATE NEW ENTRY AND RETURN
            const sub = new NotificationSubscription();
            sub.userId = info.userId;
            sub.payload = [
                {
                    channel: 'email',
                    labelEn: 'Receive an Email when',
                    labelEs: 'Recibe un Email cuando',
                    sections: [
                        {
                            labelEn: 'Audiobooks',
                            labelEs: 'Audiobooks',
                            subscriptions: [
                                {
                                    code: 'new-chapter-available',
                                    labelEn: 'New chapter is available',
                                    labelEs: 'Un nuevo capítulo está disponible',
                                    selected: true,
                                },
                                {
                                    code: 'liked-author-uploads-audiobook',
                                    labelEn: 'Author you liked uploads an audiobook',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'new-audiobook-similar-to-what-I-listen-to',
                                    labelEn: 'New audiobook similiar to what I listen to',
                                    labelEs: '',
                                    selected: true,
                                },                                
                            ]
                        },
                        {
                            labelEn: 'Debate',
                            labelEs: 'Debates',
                            subscriptions: [
                                {
                                    code: 'author-i-follow-joins-debate',
                                    labelEn: 'Author I follow joins a debate',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'new-debate-starts-about-liked-author',
                                    labelEn: 'New debate starts about liked author',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'new-debate-starts-about-liked-audiobook',
                                    labelEn: 'New debate starts about liked audiobook',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'user-adds-comment-to-one-of-my-debates',
                                    labelEn: `A user adds a comment to one of the debates I'm following`,
                                    labelEs: '',
                                    selected: true,
                                },
                            ]
                        },
                        {
                            labelEn: 'Comments',
                            labelEs: 'Comentarios',
                            subscriptions: [
                                {
                                    code: 'someone-replied-to-my-comment',
                                    labelEn: 'Someone replied to my comment',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'my-comment-receives-line',
                                    labelEn: 'My comment received likes',
                                    labelEs: '',
                                    selected: true,
                                },
                            ]
                        },
                        {
                            labelEn: 'Listening',
                            labelEs: 'Escucha',
                            subscriptions: [
                                {
                                    code: 'my-audiobook-progress-reminder',
                                    labelEn: 'My audiobook progress reminder',
                                    labelEs: '',
                                    selected: true,
                                },
                            ]
                        },
                        {
                            labelEn: 'Others',
                            labelEs: 'Otros',
                            subscriptions: [
                                {
                                    code: 'someone-followed-you',
                                    labelEn: 'Someone followed you',
                                    labelEs: '',
                                    selected: true,
                                },
                                {
                                    code: 'weekly-digest',
                                    labelEn: 'Weekly “Your World” Digest',
                                    labelEs: '',
                                    selected: true,
                                },
                            ]
                        },
                    ]
                }
            ]
            const newRecord = await sub.save();
            return res.status(200).json({
                success: true,
                subscriptions: newRecord.payload
            })
        } else {
            //  RETURN EXISTING
            return res.status(200).json({
                success: true,
                subscriptions: doc.payload
            })
        }

    } catch (ex) {
        console.log('UNEXPECTED ERROR IN FILE: ' + __filename)
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: 'Unexpected error'
        })
    }
}

function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, config.SECRET_KEY);
        // Example payload:
        // { userId: '12345', name: 'Walter' }
        return {
            userId: decoded.userId,
            name: decoded.name
        };
    } catch (err) {
        console.error('Invalid or expired token');
        return null;
    }
}

module.exports = {
    run
}