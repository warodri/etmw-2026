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
        console.log('common.js - sendEmailToUser(subject, body)');
        console.log(ex.message);
        console.log('*******************************')
    }
}

async function sendEmailWithLoginCode(toEmail, subject, code, lang) {
    try {
        const templateHtml = getLoginCodeTemplate(code, lang)
        sendEmail(toEmail, subject, templateHtml, () => {
            console.log('EMAIL ENVIADO A ' + toEmail)
        })
    } catch (ex) {
        console.log('*******************************')
        console.log('common.js - sendEmailWithLoginCode(subject, body)');
        console.log(ex.message);
        console.log('*******************************')
    }
}

function getLoginCodeTemplate(code, lang) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0e131c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0e131c;">
        <tr>
            <td style="padding: 40px 15px;">
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; background-color: #151b28; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; border-radius: 20px 20px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                📚 Enter To My World
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Your Gateway to Audiobook Excellence
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px; background-color: #151b28;">
                            
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                Your Login Code
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; color: #9ca3af; font-size: 16px; line-height: 1.75;">
                                You've requested a login code for your Enter To My World account. Use the code below to sign in:
                            </p>
                            
                            <!-- CODE BOX -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #1f2937; border: 2px dashed #2563eb; border-radius: 12px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                                            Your Login Code
                                        </p>
                                        <p style="margin: 0; color: #60a5fa; font-size: 36px; font-weight: 700; letter-spacing: 0.15em; font-family: 'Courier New', Courier, monospace;">
                                            ${code}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- INFO BOX -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                                <tr>
                                    <td style="background: rgba(37, 99, 235, 0.1); border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 8px;">
                                        <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                                            ⏰ This code will expire in <strong style="color: #ffffff;">10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- BUTTON -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://entertomyworld.com" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                                            Sign In Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0 0; color: #9ca3af; font-size: 16px; line-height: 1.75;">
                                If you're having trouble signing in, please contact our support team.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 16px;">
                                Best regards,<br>
                                <strong style="color: #ffffff;">The Enter To My World Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 0 30px; background-color: #151b28;">
                            <div style="height: 1px; background-color: #2e394a;"></div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 30px; background-color: #151b28; text-align: center; border-radius: 0 0 20px 20px;">
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 14px;">
                                <a href="https://entertomyworld.com" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">Website</a>
                                <span style="color: #6b7280;">•</span>
                                <a href="https://entertomyworld.com" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">Support</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                © 2026 Enter To My World
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
    `
}

function getTemplate(title, html, unsuscribeUrl = 'Reply to this Email if you want to unsuscribe <br>from this type of messages. Thank you!') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Enter To My World</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #0e131c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0e131c;">
        <tr>
            <td style="padding: 40px 15px;">
                
                <!-- Main Container (600px max) -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; background-color: #151b28; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; border-radius: 20px 20px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                📚 Enter To My World
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Your Gateway to Audiobook Excellence
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content Area -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #151b28;">
                            
                            <!-- Greeting -->
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                ${title}
                            </h2>
                            
                            <!-- Main Message -->
                            <p style="margin: 0 0 25px 0; color: #9ca3af; font-size: 16px; line-height: 1.75;">
                                ${html}
                            </p>
                            
                            <!-- DYNAMIC SECTIONS - Uncomment as needed -->
                            
                            <!-- BUTTON / CTA -->
                            <!--
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="{{BUTTON_URL}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);">
                                            {{BUTTON_TEXT}}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            -->
                            
                            <!-- INFO BOX / Alert -->
                            <!--
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                                <tr>
                                    <td style="background: rgba(37, 99, 235, 0.1); border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 8px;">
                                        <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                                            💡 <strong style="color: #ffffff;">{{INFO_TITLE}}</strong><br>
                                            {{INFO_MESSAGE}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            -->
                            
                            <!-- FEATURES / Cards (for newsletters) -->
                            <!--
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
                                        <p style="margin: 0 0 8px 0; font-size: 24px;">{{FEATURE_ICON}}</p>
                                        <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                                            {{FEATURE_TITLE}}
                                        </h3>
                                        <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                                            {{FEATURE_DESCRIPTION}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            -->
                            
                            <!-- STATS ROW (2 columns) -->
                            <!--
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td width="48%" style="background-color: #1f2937; border-radius: 12px; padding: 20px; text-align: center; vertical-align: top;">
                                        <p style="margin: 0 0 8px 0; color: #60a5fa; font-size: 28px; font-weight: 700;">
                                            {{STAT_1_VALUE}}
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                            {{STAT_1_LABEL}}
                                        </p>
                                    </td>
                                    <td width="4%"></td>
                                    <td width="48%" style="background-color: #1f2937; border-radius: 12px; padding: 20px; text-align: center; vertical-align: top;">
                                        <p style="margin: 0 0 8px 0; color: #60a5fa; font-size: 28px; font-weight: 700;">
                                            {{STAT_2_VALUE}}
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                            {{STAT_2_LABEL}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            -->
                            
                            <!-- Closing Message 
                            <p style="margin: 25px 0 0 0; color: #9ca3af; font-size: 16px; line-height: 1.75;">
                                {{CLOSING_MESSAGE}}
                            </p>\
                            -->
                            
                            <!-- Signature -->
                            <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 16px; line-height: 1.75;">
                                Best regards,<br>
                                <strong style="color: #ffffff;">The Enter To My World Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px; background-color: #151b28;">
                            <div style="height: 1px; background-color: #2e394a;"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #151b28; text-align: center; border-radius: 0 0 20px 20px;">
                            
                            <!-- Footer Links -->
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 14px;">
                                <a href="https://entertomyworld.com" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">Website</a>
                                <span style="color: #6b7280;">•</span>
                                <a href="https://entertomyworld.com/support" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">Support</a>
                                <span style="color: #6b7280;">•</span>
                                <a href="https://entertomyworld.com" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">Contact</a>
                            </p>
                            
                            <!-- Social Icons -->
                            <p style="margin: 0 0 20px 0;">
                                <a href="#" style="display: inline-block; margin: 0 8px; font-size: 20px; text-decoration: none;">🌐</a>
                                <a href="#" style="display: inline-block; margin: 0 8px; font-size: 20px; text-decoration: none;">📘</a>
                                <a href="#" style="display: inline-block; margin: 0 8px; font-size: 20px; text-decoration: none;">🐦</a>
                                <a href="#" style="display: inline-block; margin: 0 8px; font-size: 20px; text-decoration: none;">📸</a>
                            </p>
                            
                            <!-- Copyright & Unsubscribe -->
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                                © 2026 Enter To My World. All rights reserved.
                            </p>
                            
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                You're receiving this email because you have an account with Enter To My World.<br>
                                <a href="${unsuscribeUrl}" style="color: #60a5fa; text-decoration: none;">Unsubscribe</a> | 
                                <a href="https://entertomyworld.com" style="color: #60a5fa; text-decoration: none;">Preferences</a>
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
    `
}

const informAdmins = (subject, text) => {
    try {
        for (let email of config.ADMIN.emails) {
            sendEmail(email, subject, text, () => {
                console.log('EMAIL ENVIADO A ADMIN')
            });
        }
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
    sendEmailWithLoginCode,
    informAdmins,
}