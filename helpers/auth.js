const jwt = require('jsonwebtoken');

module.exports = {
    createAccessToken: (user) => {
        return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '15m'
        });
    },

    createRefreshToken: (user) => {
        return jwt.sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_SECRET, {
            expiresIn: '7d'
        })
    }
}