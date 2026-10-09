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
    body('description').optional({ checkFalsy: true }).isString(),
    body('hours_to_complete').isInt({ min: 1 }).withMessage('Hours to complete must be a positive integer'),
    body('course_link').isURL().withMessage('Course link must be a valid URL'),
    body('labels').isArray().withMessage('Labels must be an array'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
]; 

async function recordActivity(client, activity) {
    const { userId, courseId, title, type, progress, details = {} } = activity;
    await client.query(
        'INSERT INTO learning_activity (user_id, course_id, course_title, activity_type, progress, details) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, courseId, title, type, progress, JSON.stringify(details)]
    );
}

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
    const progress = Number(req.body.progress || 0);
    const client = await pg.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            'INSERT INTO courses (user_id, title, description, hours_to_complete, course_link, labels, progress, completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [user.id, title, description || null, hours_to_complete, course_link, labels, progress, progress === 100]
        );
        const course = result.rows[0];
        await recordActivity(client, {
            userId: user.id,
            courseId: course.id,
            title: course.title,
            type: 'course_added',
            progress,
            details: { progress },
        });
        await client.query('COMMIT');
        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to create course:', error);
        res.status(500).json({ message: 'Could not create this course.' });
    } finally {
        client.release();
    }
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
    const client = await pg.connect();
    try {
        await client.query('BEGIN');
        const existingResult = await client.query(
            'SELECT * FROM courses WHERE id = $1 AND user_id = $2 FOR UPDATE',
            [id, user.id]
        );
        if (existingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Course not found or not authorized' });
        }

        const previousCourse = existingResult.rows[0];
        const progress = req.body.progress === undefined ? Number(previousCourse.progress ?? (previousCourse.completed ? 100 : 0)) : Number(req.body.progress);
        const updatedFields = [];
        if (previousCourse.title !== title) updatedFields.push('title');
        if ((previousCourse.description || '') !== (description || '')) updatedFields.push('description');
        if (Number(previousCourse.hours_to_complete) !== Number(hours_to_complete)) updatedFields.push('hours_to_complete');
        if (previousCourse.course_link !== course_link) updatedFields.push('course_link');
        if (JSON.stringify(previousCourse.labels || []) !== JSON.stringify(labels || [])) updatedFields.push('labels');
        const previousProgress = Number(previousCourse.progress ?? (previousCourse.completed ? 100 : 0));
        const progressChanged = previousProgress !== progress;
        if (progressChanged) updatedFields.push('progress');

        const result = await client.query(
            'UPDATE courses SET title = $1, description = $2, hours_to_complete = $3, course_link = $4, labels = $5, progress = $6, completed = ($6 = 100), updated_at = CASE WHEN $9 THEN CURRENT_TIMESTAMP ELSE updated_at END WHERE id = $7 AND user_id = $8 RETURNING *',
            [title, description || null, hours_to_complete, course_link, labels, progress, id, user.id, updatedFields.length > 0]
        );
        const course = result.rows[0];

        if (updatedFields.length) {
            const activityType = progressChanged
                ? (previousProgress < 100 && progress === 100 ? 'course_completed' : 'progress_updated')
                : 'course_updated';
            await recordActivity(client, {
                userId: user.id,
                courseId: course.id,
                title: course.title,
                type: activityType,
                progress,
                details: { updated_fields: updatedFields, previous_progress: previousProgress },
            });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update course:', error);
        res.status(500).json({ message: 'Could not update this course.' });
    } finally {
        client.release();
    }
});

router.delete('/:id', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const client = await pg.connect();
    try {
        await client.query('BEGIN');
        const courseResult = await client.query(
            'SELECT id, title, progress FROM courses WHERE id = $1 AND user_id = $2 FOR UPDATE',
            [id, user.id]
        );
        if (courseResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Course not found or not authorized' });
        }

        const course = courseResult.rows[0];
        await recordActivity(client, {
            userId: user.id,
            courseId: course.id,
            title: course.title,
            type: 'course_deleted',
            progress: Number(course.progress) || 0,
        });
        await client.query('DELETE FROM courses WHERE id = $1 AND user_id = $2', [id, user.id]);
        await client.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to delete course:', error);
        res.status(500).json({ message: 'Could not delete this course.' });
    } finally {
        client.release();
    }
});

module.exports = router;