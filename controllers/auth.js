const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
    const tokenData = req.headers.authorization?.split(' ')[1];
    if (tokenData) {
        return res.status(401).json({ message: 'Already logged in' });
    }
    next();
};

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { isLoggedIn, signToken };