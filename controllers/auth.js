const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
    const tokenData = req.headers.authorization?.split(' ')[1];
    if (tokenData) {
        try {
            const decoded = jwt.verify(tokenData, process.env.JWT_SECRET);
            if (decoded) {
                return res.status(401).json({ message: 'Already logged in' });
            }
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
    next();
};

const checkLoggedIn = (req, res, next) => {
    const tokenData = req.headers.authorization?.split(' ')[1];
    if (!tokenData) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const decoded = jwt.verify(tokenData, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Not logged in' });
        }
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next();
};

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const getUserFromToken = (req) => {
    const tokenData = req.headers.authorization?.split(' ')[1];
    if (!tokenData) return null;
    try {
        const decoded = jwt.verify(tokenData, process.env.JWT_SECRET);
        console.log(decoded);
        return decoded || null;
    } catch (err) {
        return null;
    }
};


module.exports = { isLoggedIn, checkLoggedIn, signToken, getUserFromToken };