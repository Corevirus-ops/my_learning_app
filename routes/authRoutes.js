const express = require('express');
const router = express.Router();
const pool = require('../controllers/pg');
const bcrypt = require('bcrypt');
const { isLoggedIn, signToken } = require('../controllers/auth');
const { body, validationResult, oneOf } = require('express-validator');

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

router.post('/register', isLoggedIn, validateRegister, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    
    if (await checkUserExists(username, email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    await createUser(username, email, password);
    const token = signToken({ username, email });
    res.status(201).json({ message: 'User created successfully', token  });
});

//username or email is required for login
const validateLogin = [
    oneOf([
        body('username').notEmpty().withMessage('Username is required'),
        body('email').notEmpty().withMessage('Email is required')
    ]),
    body('password').notEmpty().withMessage('Password is required')
    
];

router.post('/login', isLoggedIn, validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    const user = result.rows[0];
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = signToken({ username: user.username, email: user.email });
    res.status(200).json({ message: 'Login successful', token });
});

module.exports = router;

