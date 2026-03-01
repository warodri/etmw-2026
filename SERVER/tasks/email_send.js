const jwt = require('jsonwebtoken');
const config = require('../config');
const { sendEmailToUser } = require('../workers/email');
const Audiobook = require('../models/audiobook');
const User = require('../models/user');
const Author = require('../models/author');
const Debate = require('../models/debate');
const Comment = require('../models/comment');
const Subscription = require('../models/subscription');

/**
 * Sends an email to a userId when an autor this userId follows uploads a new audiobok
 */
async function likedAuthorUploadsAudiobook(lang, userId, authorId) {
    //  Get the author
    const author = await getAuthor(authorId);
    if (!author) {
        console.log('likedAuthorUploadsAudiobook - Invalid author');
        return false;
    }
    const penName = author.penName;
    //  Get the user for this author
    const authorUserId = await getUser(author.userId);
    if (!authorUserId) {
        console.log('likedAuthorUploadsAudiobook - Invalid user for this author');
        return false;
    }
    //  Get the user to send the email to
    const user = await getUser(userId);
    if (!user) {
        console.log('likedAuthorUploadsAudiobook - Invalid user to send email to');
        return false;
    }
    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });      
    const url = CLIENT + '/#/app/search/author/' + author._id;
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Set the subject and email body
    const subject = lang == 'es' ? `Un Autor que Sigues Acaba de Subir un Audiobook` : `An Author you Follow Just Uploaded an Audiobook`;
    const body = lang == 'es' ? `   
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                El autor ${penName} acaba de subir un nuevo audiobook! 
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Toca aquí para ver más
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                Author ${penName} has just uploaded a new audiobook! 
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Click here to know more
                </a>
            </p>
        </div>
    `
    //  Send the email and return
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to a userId telling a new chapter (of a book this userId is listening to) was uploaded
 */
async function newChapterAvailable(lang, userId, audiobookId, chapterNumber) {
    //  Get the audiobook
    const audiobook = await getAudiobook(audiobookId);
    if (!audiobook) {
        console.log('newChapterAvailable - Invalid audiobook');
        return false;
    }
    //  Get the user email
    const user = await getUser(userId);
    if (!user) {
        console.log('newChapterAvailable - Invalid user');
        return false;
    }
    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });      
    const url = CLIENT + '/#/app/audiobook/view/' + audiobook._id;
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Set the subject and email body
    const subject = lang == 'es' ? `Un Nuevo Capítulo Está Disponible para Escuchar!` : `A New Chapter is Available to Listen!`;
    const body = lang == 'es' ? `   
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                ¡El capítulo ${chapterNumber} ya está disponible para el audiolibro que estás escuchando!
            </p>
            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${audiobook.title}
            </h2>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Haz clic aquí para acceder
                </a>
            </p>
        </div>    
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                Chapter ${chapterNumber} was added for the audiobook you are reading! 
            </p>
            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${audiobook.title}
            </h2>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Click here to access
                </a>
            </p>
        </div>
    `
    //  Send the email and return
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId when an author this userId is following or lines, sends a message to a debate or the 
 * author starts a debate.
 */
async function authorUserFollowsJoinsADebate(lang, userId, authorId, debateId) {
    //  Get the author
    const author = await getAuthor(authorId);
    if (!author) {
        console.log('authorUserFollowsJoinsADebate - Invalid author');
        return false;
    }
    const penName = author.penName;
    //  Get the debate
    const debate = await getDebate(debateId);
    if (!debate) {
        console.log('authorUserFollowsJoinsADebate - Invalid debate');
        return false;
    }
    const audiobookId = debate.audiobookId;
    //  Get the audiobook
    const audiobook = await getAudiobook(audiobookId);
    if (!audiobook) {
        console.log('authorUserFollowsJoinsADebate - Invalid audiobook');
        return false;
    }
    //  Get the user to send the email to
    const user = await getUser(userId);
    if (!user) {
        console.log('authorUserFollowsJoinsADebate - Invalid user to send email to');
        return false;
    }
    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });      
    const url = CLIENT + '/#/app/debate/' + debate._id;
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Set the subject and email body
    const subject = lang == 'es' ? `Un Autor que Sigues se ha Unido a un Debate` : `An Author you Follow Just Joined a Debate`;
    const body = lang == 'es' ? `   
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                Un autor que sigues, ${penName} acaba de unirse a un debate! 
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Toca aquí para ver más
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                An author you follow, ${penName} has just joined a debate! 
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Click here to know more
                </a>
            </p>
        </div>
    `
    //  Send the email and return
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId when a debate starts and the debate is about an author this userId follows or likes
 */
async function newDebateStartsAboutAuthorFollowing(lang, userId, authorId, debateId) {
    //  Get the author
    const author = await getAuthor(authorId);
    if (!author) {
        console.log('authorUserFollowsJoinsADebate - Invalid author');
        return false;
    }
    const penName = author.penName;
    //  Get the debate
    const debate = await getDebate(debateId);
    if (!debate) {
        console.log('authorUserFollowsJoinsADebate - Invalid debate');
        return false;
    }
    const audiobookId = debate.audiobookId;
    //  Get the audiobook
    const audiobook = await getAudiobook(audiobookId);
    if (!audiobook) {
        console.log('authorUserFollowsJoinsADebate - Invalid audiobook');
        return false;
    }
    //  Get the user to send the email to
    const user = await getUser(userId);
    if (!user) {
        console.log('authorUserFollowsJoinsADebate - Invalid user to send email to');
        return false;
    }
    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });      
    const url = CLIENT + '/#/app/debate/' + debate.audiobookId;
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Set the subject and email body
    const subject = lang == 'es' ? `Se ha Iniciado un Debate sobre un Autor que Sigues` : `A Debate About an Author You Follow Just Started`;
    const body = lang == 'es' ? `   
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                Se ha iniciado un debate sobre un audiobook de un autor que sigues: ${penName} 
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Toca aquí para ver más
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                A new debate has started about an audiobook by an author you follow: ${penName}.
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Open debate
                </a>
            </p>
        </div>
    `
    //  Send the email and return
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId when a debate starts about an audiobook this userId likes or follows
 */
async function newDebateStartsAboutLikedAudiobook(lang, userId, authorId, audiobookId) {
    //  Get user
    const user = await getUser(userId);
    if (!user) {
        console.log('newDebateStartsAboutLikedAudiobook - Invalid user');
        return false;
    }
    //  Get audiobook
    const audiobook = await getAudiobook(audiobookId);
    if (!audiobook) {
        console.log('newDebateStartsAboutLikedAudiobook - Invalid audiobook');
        return false;
    }
    //  Optional author context
    const author = await getAuthor(authorId);
    const penName = author && author.penName ? author.penName : audiobook.authorName;
    //  Create URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });
    const url = CLIENT + '/#/app/debate/' + audiobook._id;
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Subject and body
    const subject = lang == 'es'
        ? `Nuevo Debate sobre un Audiobook que Te Interesa`
        : `New Debate About an Audiobook You Like`;
    const body = lang == 'es' ? `
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                Se inició un nuevo debate sobre un audiobook que sigues o te gusta.
            </p>
            <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${audiobook.title}
            </h2>
            <p style="margin: 0 0 20px 0; color: #9ca3af;">
                ${penName ? 'Autor: ' + penName : ''}
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Ver debate
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                A new debate started about an audiobook you follow or like.
            </p>
            <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${audiobook.title}
            </h2>
            <p style="margin: 0 0 20px 0; color: #9ca3af;">
                ${penName ? 'Author: ' + penName : ''}
            </p>
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Open debate
                </a>
            </p>
        </div>
    `;
    //  Send email
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId when another user adds a comment in a debate this userId already sent a comment. 
 */
async function anotherUserAddsCommentToADebateThisUserAlsoCommented(lang, userId, commentId) {
    //  Get recipient user
    const user = await getUser(userId);
    if (!user) {
        console.log('anotherUserAddsCommentToADebateThisUserAlsoCommented - Invalid user');
        return false;
    }
    //  Get new comment
    const comment = await getComment(commentId);
    if (!comment) {
        console.log('anotherUserAddsCommentToADebateThisUserAlsoCommented - Invalid comment');
        return false;
    }
    //  Do not email if user commented themselves
    if (String(comment.userId) === String(user._id)) {
        return false;
    }
    //  Get actor
    const actor = await getUser(comment.userId);
    const actorName = actor && actor.firstName ? actor.firstName : 'Another user';
    //  Resolve debate / audiobook context
    let debateId = null;
    let audiobookId = null;
    if (String(comment.targetType) === 'debate') {
        debateId = comment.targetId;
    } else if (String(comment.targetType) === 'comment') {
        const parentComment = await getComment(comment.targetId);
        if (parentComment && String(parentComment.targetType) === 'debate') {
            debateId = parentComment.targetId;
        }
    }
    if (debateId) {
        const debate = await getDebate(debateId);
        if (debate) {
            audiobookId = debate.audiobookId;
        }
    }
    const audiobook = audiobookId ? await getAudiobook(audiobookId) : null;
    const audiobookTitle = audiobook ? audiobook.title : null;

    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });
    const url = audiobookId ? CLIENT + '/#/app/debate/' + audiobookId : CLIENT + '/#/app/debate';
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Subject and body
    const subject = lang == 'es'
        ? `Nuevo Comentario en un Debate que Sigues`
        : `New Comment in a Debate You Follow`;
    const body = lang == 'es' ? `
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                ${actorName} agregó un nuevo comentario en un debate donde ya participaste.
            </p>
            ${audiobookTitle ? `
                <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${audiobookTitle}
                </h2>
            ` : ''}
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Ver comentarios
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                ${actorName} added a new comment in a debate where you already participated.
            </p>
            ${audiobookTitle ? `
                <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${audiobookTitle}
                </h2>
            ` : ''}
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    View comments
                </a>
            </p>
        </div>
    `;
    //  Send email
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId when another user replies to a comment this userId addded in a debate. 
 */
async function someoneRepliestoMyComment(lang, userId, commentId) {
    //  Get recipient user
    const user = await getUser(userId);
    if (!user) {
        console.log('someoneRepliestoMyComment - Invalid user');
        return false;
    }
    //  Get new reply
    const comment = await getComment(commentId);
    if (!comment) {
        console.log('someoneRepliestoMyComment - Invalid comment');
        return false;
    }
    //  Ensure this is a reply
    if (!comment.parentCommentId) {
        console.log('someoneRepliestoMyComment - parentCommentId not found');
        return false;
    }
    const parentComment = await getComment(comment.parentCommentId);
    if (!parentComment) {
        console.log('someoneRepliestoMyComment - Invalid parent comment');
        return false;
    }
    //  Do not notify self-replies
    if (String(comment.userId) === String(user._id)) {
        return false;
    }
    const actor = await getUser(comment.userId);
    const actorName = actor && actor.firstName ? actor.firstName : 'Someone';
    //  Resolve debate / audiobook context
    let debateId = null;
    let audiobookId = null;
    if (String(parentComment.targetType) === 'debate') {
        debateId = parentComment.targetId;
    } else if (String(parentComment.targetType) === 'comment') {
        const parentOfParent = await getComment(parentComment.targetId);
        if (parentOfParent && String(parentOfParent.targetType) === 'debate') {
            debateId = parentOfParent.targetId;
        }
    }
    if (debateId) {
        const debate = await getDebate(debateId);
        if (debate) {
            audiobookId = debate.audiobookId;
        }
    }
    const audiobook = audiobookId ? await getAudiobook(audiobookId) : null;
    const audiobookTitle = audiobook ? audiobook.title : null;

    //  Create the URLs
    const CLIENT = getClient();
    const token = jwt.sign({ 
        userId: user._id, 
        name: user.firstName 
    },
    config.SECRET_KEY,
    { 
        expiresIn: '5d' 
    });
    const url = audiobookId ? CLIENT + '/#/app/debate/' + audiobookId : CLIENT + '/#/app/debate';
    const unsuscribeUrl = CLIENT + '/#/app/subscriptions/' + token;
    //  Subject and body
    const subject = lang == 'es'
        ? `Alguien Respondió a tu Comentario`
        : `Someone Replied to Your Comment`;
    const body = lang == 'es' ? `
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                ${actorName} respondió a uno de tus comentarios.
            </p>
            ${audiobookTitle ? `
                <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${audiobookTitle}
                </h2>
            ` : ''}
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    Ver respuesta
                </a>
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                ${actorName} replied to one of your comments.
            </p>
            ${audiobookTitle ? `
                <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${audiobookTitle}
                </h2>
            ` : ''}
            <p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                    View reply
                </a>
            </p>
        </div>
    `;
    //  Send email
    await sendEmailToUser(user.email, subject, body, unsuscribeUrl, lang);
    return true;
}

/**
 * Sends an email to this userId with a summary of all the audiobook chapters this userId is listening to
 */
async function myAudiobookProgressReminder(lang, userId) {
    //  NOT FOR NOW
}

/**
 * Sends an email to this userId with a summary of:
 * 1) The listening time this past week
 * 2) Number of audiobooks already finished. If none, then sends "You are XX% to finish your first audiobook"
 * 3) Some audiobooks recommendations based on the current listening.
 * 4) Audiobook titles this user is debating. If none, send something like "Fancy joining a debate?" and the link to go to Debates.
 */
async function weeklyDigest(lang, userId) {
    //  NOT FOR NOW
}

/**
 * Sends an email to this userId when a successful payment to a subscription was created for the first time.
 */
async function youAreSubscribed(lang, userId) {
    const subscriptionPlan = await getSubscriptionPlan(userId);
    if (!subscriptionPlan) {
        console.log('youAreSubscribed - Invalid subscription plan');
        return false;
    }
    const user = await getUser(userId);
    if (!user) {
        console.log('youAreSubscribed - Invalid user');
        return false;
    }
    const CLIENT = getClient();
    const subject = lang == 'es'
        ? 'Tu Suscripción Está Activa'
        : 'Your Subscription Is Active';
    const planName = formatPlanName(subscriptionPlan.plan);
    const amountText = getAmountLabel(subscriptionPlan);
    const body = lang == 'es' ? `
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                ¡Gracias por suscribirte! Tu plan ya está activo y listo para usar.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #1f2937; border-radius: 12px;">
                <tr>
                    <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; line-height: 1.7;">
                        <strong>Plan:</strong> ${planName}<br>
                        <strong>Estado:</strong> ${subscriptionPlan.status || 'active'}<br>
                        ${amountText ? `<strong>Pago:</strong> ${amountText}<br>` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #9ca3af;">
                Este es un mensaje informativo. No necesitas realizar ninguna acción.
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                Thanks for subscribing. Your plan is active and ready to use.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #1f2937; border-radius: 12px;">
                <tr>
                    <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; line-height: 1.7;">
                        <strong>Plan:</strong> ${planName}<br>
                        <strong>Status:</strong> ${subscriptionPlan.status || 'active'}<br>
                        ${amountText ? `<strong>Payment:</strong> ${amountText}<br>` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #9ca3af;">
                This is an informational email only. No action is required.
            </p>
        </div>
    `;
    //  Template currently expects a URL. Use app root for informational-only emails.
    await sendEmailToUser(user.email, subject, body, CLIENT + '/#/app', lang);
    return true;
}

/**
 * Sends an email to this userId when the user already had a plan and now the userId moved and paid another plan
 */
async function yourSubscriptionPlanChanged(lang, userId) {
    const subscriptionPlan = await getSubscriptionPlan(userId);
    if (!subscriptionPlan) {
        console.log('yourSubscriptionPlanChanged - Invalid subscription plan');
        return false;
    }
    const user = await getUser(userId);
    if (!user) {
        console.log('yourSubscriptionPlanChanged - Invalid user');
        return false;
    }
    const CLIENT = getClient();
    const subject = lang == 'es'
        ? 'Tu Plan de Suscripción Fue Actualizado'
        : 'Your Subscription Plan Was Updated';
    const planName = formatPlanName(subscriptionPlan.plan);
    const amountText = getAmountLabel(subscriptionPlan);
    const body = lang == 'es' ? `
        <div style="color:white">
            Hola, ${user.firstName}
            <p>
                Tu plan de suscripción se actualizó correctamente.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #1f2937; border-radius: 12px;">
                <tr>
                    <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; line-height: 1.7;">
                        <strong>Plan actual:</strong> ${planName}<br>
                        <strong>Estado:</strong> ${subscriptionPlan.status || 'active'}<br>
                        ${amountText ? `<strong>Pago:</strong> ${amountText}<br>` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #9ca3af;">
                Este es un mensaje informativo. No necesitas realizar ninguna acción.
            </p>
        </div>
    ` : `
        <div style="color:white">
            Hello, ${user.firstName}
            <p>
                Your subscription plan was updated successfully.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0; background-color: #1f2937; border-radius: 12px;">
                <tr>
                    <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; line-height: 1.7;">
                        <strong>Current plan:</strong> ${planName}<br>
                        <strong>Status:</strong> ${subscriptionPlan.status || 'active'}<br>
                        ${amountText ? `<strong>Payment:</strong> ${amountText}<br>` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; color: #9ca3af;">
                This is an informational email only. No action is required.
            </p>
        </div>
    `;
    //  Template currently expects a URL. Use app root for informational-only emails.
    await sendEmailToUser(user.email, subject, body, CLIENT + '/#/app', lang);
    return true;
}



//
//  HELPER FUNCTIONS
//

async function getAudiobook(audiobookId) {
    const audiobook = await Audiobook.findOne({
        _id: audiobookId,
        published: true,
        enabled: true
    })
    return audiobook;
}

async function getUser(userId) {
    const user = await User.findOne({
        _id: userId,
        enabled: true
    })
    return user;
}

async function getAuthor(authorId) {
    const author = await Author.findOne({
        _id: authorId,
        enabled: true
    })
    return author;
}

async function getDebate(debateId) {
    const debate = await Debate.findOne({
        _id: debateId,
        enabled: true
    })
    return debate;
}

async function getComment(commentId) {
    const comment = await Comment.findOne({
        _id: commentId,
        enabled: true
    })
    return comment;
}

async function getSubscriptionPlan(userId) {
    const subscriptionPlan = await Subscription.findOne({
        userId,
        enabled: true
    })
    return subscriptionPlan;
}

function getClient() {
    const CLIENT = config.dev ? config.CLIENT.local : config.CLIENT.remote;
    return CLIENT;
}

function formatPlanName(plan) {
    const names = {
        explorer: 'Explorer',
        reader: 'Reader',
        unlimited: 'Unlimited'
    };
    return names[plan] || 'Unknown';
}

function getAmountLabel(subscriptionPlan) {
    if (!subscriptionPlan || !subscriptionPlan.paymentAmount) {
        return null;
    }
    const currency = (subscriptionPlan.currency || 'USD').toUpperCase();
    return `${subscriptionPlan.paymentAmount} ${currency}`;
}

module.exports = {
    likedAuthorUploadsAudiobook,
    newChapterAvailable,
    authorUserFollowsJoinsADebate,
    newDebateStartsAboutAuthorFollowing,
    newDebateStartsAboutLikedAudiobook,
    anotherUserAddsCommentToADebateThisUserAlsoCommented,
    someoneRepliestoMyComment,
    myAudiobookProgressReminder,
    weeklyDigest,
    youAreSubscribed,
    yourSubscriptionPlanChanged
}
