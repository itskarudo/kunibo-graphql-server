const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token || token === "") {
        req.isAuth = false;
        return next();
    }

    const { JWT_SECRET } = process.env;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;

    next();

}