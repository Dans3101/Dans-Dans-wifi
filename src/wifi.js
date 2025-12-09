function generateVoucher() {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    return code;
}

module.exports = { generateVoucher };