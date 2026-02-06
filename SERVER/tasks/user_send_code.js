async function run(data, req, res) {
    try {
        const {
            email,
        } = data;
        
        //  Validate
        if (!email) {
            return res.status(200).json({
                success: false,
                message: 'Missing data'
            })        
        }

        //  Imports to use
        const common = require('../workers/utils');
        const UserModel = require('../models/user');
        const emailUtils = require('../workers/email');

        //  Generate code
        let code = common.generateUnique6DigitNumber()
        if (!code) {
            return res.status(200).json({
                success: false,
                message: 'Unknown error'
            })
        } 

        //  Create or Update email
        const user = await UserModel.findOne({
            email,
            enabled: true
        })          
        if (!user) {
            const record = new UserModel();
            record.email = email;
            record.code = code;            
            await record.save();
        } else {
            user.code = code;
            await user.save();
        }

        //  Send code to email
        await emailUtils.sendEmailToUser(email, 
            `📌 Your Secure Login Code - Don't share`, 
            `
            <p>Hey there!</p>

            <p>
            🔑 This is your Your Login Code:
            </p>
            <h1>${ code }</h1>

            <p>
            For security reasons, this code will expire soon, 
            so do use it promptly. If you didn't request this, 
            feel free to ignore. <b>No action needed</b>
            </p>

            <p>
            Cheers, <br>
            <b>The Team at Enter To My World</b>
            </p>
        `)

        //  Avisar a los ADMIN
        emailUtils.informAdmins('ETMW 2026 - NEW ACCOUNT / LOGIN REQUEST FROM ' + email,`Email ${ email } `);

        //  Finally respond to client
        res.status(200).json({
            success: true,
        })

    } catch(ex) {
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