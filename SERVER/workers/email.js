const config = require('../config');

async function sendEmailToUser(toEmail, subject, html, lang) {
    try {
        const templateHtml = getTemplate(
            subject,
            html,
            lang == 'es' ? 'Responde a este mensaje si no quieres recibir notificaciones' : `Reply to this message if you don't want to receive more notifications`
        )
        sendEmail(toEmail, subject, templateHtml, () => {
            console.log('EMAIL ENVIADO A ' + toEmail)
        })
    } catch (ex) {
        console.log('*******************************')
        console.log('common.js - sendEmailToAdmins(subject, body)');
        console.log(ex.message);
        console.log('*******************************')
    }
}

function getTemplate(title, html, unsuscribeUrl = 'Reply to this Email if you want to unsuscribe <br>from this type of messages. Thank you!') {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enter To My World</title>
    </head>
    <body style="font-family: Arial; background-color: #f2f2f2;">
        <div style="padding:2rem; display:flex; flex-direction: row; justify-content: center; align-items: center;">
            <div style="max-width: 800px; min-width: 300px;">
                <div style="background-color:#333; border-radius:30px; box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;">
                    <div style="padding:1.5rem;">
                        <div style="font-size: 25px; color:white;">
                            <b>${ title }</b>
                        </div> 
                    </div>
                    <div style="background-color: #fff; border-radius: 30px;">
                        <div style="padding:1.5rem; font-size: 18px; line-height: 150%;">
                            ${ html }
                        </div>
                    </div>
                </div>                    
                <div style="text-align: center; margin-top:1.5rem;">
                    <a href="https://entertomyworld.com" style="text-decoration: none;">
                        https://entertomyworld.com
                    </a>
                    <div style="margin-top:10px">
                        &copy; 2024 - All Right Reserved
                    </div>
                    <div style="margin-top:2rem; color: #999;">
                        <small>${ unsuscribeUrl }</small>
                    </div>
                    <div style="margin-top:2rem;">
                        <a href="https://entertomyworld.com/#/privacy" style="text-decoration: none;">
                            Privacy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>    
    `
}

const informAdmins = (subject, text) => {
    try {
        sendEmail(config.EMAIL.admin, subject, text, () => {
            console.log('EMAIL ENVIADO A ADMIN')
        });
    } catch (ex) {
        console.log(ex);
    }
}

const sendEmail = (to, subject, html, callback) => {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: config.EMAIL.provider.login.username,
            pass: config.EMAIL.provider.login.password,
        },
    });
    const mailOptions = {
        from: config.EMAIL.provider.login.from,
        to,
        subject,
        html,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
            callback(false);
        } else {
            callback(true);
        }
    });
}

module.exports = {
    sendEmailToUser,
    informAdmins
}