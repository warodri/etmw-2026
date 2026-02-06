const crypto = require("crypto");

function generate6AlphanumericCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid ambiguous characters
    let code = "";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}

function generateUnique6DigitNumber() {
    const crypto = require('crypto');
    // Generate a random number between 0 and 999999
    const randomNum = crypto.randomInt(0, 1000000);
    // Pad the number with leading zeros to ensure it has 6 digits
    const sixDigitNum = String(randomNum).padStart(6, '0');
    return sixDigitNum;
}

module.exports = {
    generate6AlphanumericCode,
    generateUnique6DigitNumber,
}