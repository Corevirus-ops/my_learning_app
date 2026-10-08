const express = require('express');
const router = express.Router();
const pg = require('../controllers/pg');
const { checkLoggedIn, getUserFromToken } = require('../controllers/auth');
const { body, validationResult } = require('express-validator');

router.get('/', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const courses = await pg.query('SELECT * FROM courses WHERE user_id = $1', [user.id]);

    res.status(200).json({ message: 'Courses retrieved successfully', courses: courses.rows });
});

router.get('/:id', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const result = await pg.query('SELECT * FROM courses WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found or not authorized' });
    }
    res.status(200).json({ message: 'Course retrieved successfully', course: result.rows[0] });
});

const validateCourse = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('hours_to_complete').isInt({ min: 1 }).withMessage('Hours to complete must be a positive integer'),
    body('course_link').isURL().withMessage('Course link must be a valid URL'),
    body('labels').isArray().withMessage('Labels must be an array')
]; 

router.post('/', checkLoggedIn, validateCourse, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { title, description, hours_to_complete, course_link, labels } = req.body;
    const result = await pg.query('INSERT INTO courses (user_id, title, description, hours_to_complete, course_link, labels) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user.id, title, description, hours_to_complete, course_link, labels]);
    res.status(201).json({ message: 'Course created successfully', course: result.rows[0] });
});

router.put('/:id', checkLoggedIn, validateCourse, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { title, description, hours_to_complete, course_link, labels } = req.body;
    const result = await pg.query('UPDATE courses SET title = $1, description = $2, hours_to_complete = $3, course_link = $4, labels = $5 WHERE id = $6 AND user_id = $7 RETURNING *', [title, description, hours_to_complete, course_link, labels, id, user.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found or not authorized' });
    }
    res.status(200).json({ message: 'Course updated successfully', course: result.rows[0] });
});

router.delete('/:id', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const result = await pg.query('DELETE FROM courses WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Course not found or not authorized' });
    }
    res.status(204).send();
});

module.exports = router;