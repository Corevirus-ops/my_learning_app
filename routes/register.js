const express = require('express');
const router = express.Router();
const pool = require('../controllers/pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const isLoggedIn = (tokenData) => {
    if (!tokenData) {
        return false;
    }
    try {
        const decoded = jwt.verify(tokenData, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return false;
    }
}

const handlePassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

const checkUserExists = async (username, email) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    return result.rows.length > 0;
};

const createUser = async (username, email, password) => {
    const hashedPassword = await handlePassword(password);
    await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
};

const validateRegister = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

router.post('/', validateRegister, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    const tokenData = req.headers.authorization?.split(' ')[1];
    const loggedInUser = isLoggedIn(tokenData);
    if (loggedInUser) {
        return res.status(400).json({ message: 'User already logged in' });
    }
    
    if (await checkUserExists(username, email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    await createUser(username, email, password);
    const token = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created successfully', token  });
});

module.exports = router;

