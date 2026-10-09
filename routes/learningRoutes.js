const express = require('express');
const { body, validationResult } = require('express-validator');
const pg = require('../controllers/pg');
const { checkLoggedIn, getUserFromToken } = require('../controllers/auth');

const router = express.Router();

function getLocalDate(timezone, date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(date, days) {
    const shifted = new Date(`${date}T00:00:00.000Z`);
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return shifted.toISOString().slice(0, 10);
}

function normalizeDate(value) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function getLongestStreak(dates) {
    let longest = 0;
    let current = 0;
    let previous = null;

    for (const date of [...dates].sort()) {
        current = previous && shiftDate(previous, 1) === date ? current + 1 : 1;
        longest = Math.max(longest, current);
        previous = date;
    }

    return longest;
}

async function getSettings(userId) {
    const result = await pg.query(
        'SELECT weekly_active_goal, timezone FROM user_settings WHERE user_id = $1',
        [userId]
    );
    return result.rows[0]
        ? { ...result.rows[0], is_configured: true }
        : { weekly_active_goal: 5, timezone: 'UTC', is_configured: false };
}

function getRequestTimezone(req, fallback) {
    const timezone = req.get('X-Timezone');
    if (!timezone || timezone.length > 100) return fallback;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return timezone;
    } catch {
        return fallback;
    }
}

router.get('/summary', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const settings = await getSettings(user.id);
        if (!settings.is_configured) settings.timezone = getRequestTimezone(req, settings.timezone);
        const result = await pg.query(
            "SELECT DISTINCT (created_at AT TIME ZONE $2)::date AS activity_date FROM learning_activity WHERE user_id = $1 AND activity_type <> 'course_deleted' ORDER BY activity_date DESC",
            [user.id, settings.timezone]
        );
        const dates = result.rows.map((row) => normalizeDate(row.activity_date));
        const dateSet = new Set(dates);
        const today = getLocalDate(settings.timezone);
        const yesterday = shiftDate(today, -1);
        let streak = 0;
        let activeDate = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;

        while (activeDate && dateSet.has(activeDate)) {
            streak += 1;
            activeDate = shiftDate(activeDate, -1);
        }

        const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay();
        const daysSinceMonday = (weekday + 6) % 7;
        const weekStart = shiftDate(today, -daysSinceMonday);
        const activeDaysThisWeek = dates.filter((date) => date >= weekStart && date <= today).length;

        res.status(200).json({
            current_streak: streak,
            longest_streak: getLongestStreak(dates),
            active_days_this_week: activeDaysThisWeek,
            weekly_active_goal: Number(settings.weekly_active_goal),
            active_today: dateSet.has(today),
            last_active_date: dates[0] || null,
            timezone: settings.timezone,
        });
    } catch (error) {
        console.error('Failed to load learning summary:', error);
        res.status(500).json({ message: 'Could not load your learning summary.' });
    }
});

router.get('/history', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

    try {
        const settings = await getSettings(user.id);
        if (!settings.is_configured) settings.timezone = getRequestTimezone(req, settings.timezone);
        const result = await pg.query(
            'SELECT id, course_id, course_title, activity_type, progress, details, created_at FROM learning_activity WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
            [user.id, limit]
        );
        res.status(200).json({ activities: result.rows, timezone: settings.timezone });
    } catch (error) {
        console.error('Failed to load learning history:', error);
        res.status(500).json({ message: 'Could not load your learning history.' });
    }
});

router.get('/insights', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const result = await pg.query(
            'SELECT id, title, labels, hours_to_complete, progress, completed, updated_at FROM courses WHERE user_id = $1 ORDER BY updated_at DESC',
            [user.id]
        );
        const courses = result.rows;
        const skillMap = new Map();
        for (const course of courses) {
            for (const label of course.labels || []) {
                const normalizedLabel = label.trim();
                if (!normalizedLabel) continue;
                const key = normalizedLabel.toLocaleLowerCase();
                const skill = skillMap.get(key) || { name: normalizedLabel, course_count: 0, progress_total: 0 };
                skill.course_count += 1;
                skill.progress_total += Number(course.progress ?? (course.completed ? 100 : 0));
                skillMap.set(key, skill);
            }
        }

        const skills = [...skillMap.values()]
            .map((skill) => ({ ...skill, average_progress: Math.round(skill.progress_total / skill.course_count) }))
            .sort((first, second) => second.course_count - first.course_count || second.average_progress - first.average_progress || first.name.localeCompare(second.name));
        const plannedHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0), 0);
        const completedCount = courses.filter((course) => Number(course.progress ?? (course.completed ? 100 : 0)) >= 100).length;
        const averageProgress = courses.length
            ? Math.round(courses.reduce((total, course) => total + Number(course.progress ?? (course.completed ? 100 : 0)), 0) / courses.length)
            : 0;

        res.status(200).json({
            course_count: courses.length,
            completed_count: completedCount,
            planned_hours: plannedHours,
            average_progress: averageProgress,
            skills,
            recently_updated: courses.slice(0, 5),
        });
    } catch (error) {
        console.error('Failed to load learning insights:', error);
        res.status(500).json({ message: 'Could not load your learning insights.' });
    }
});

router.get('/settings', checkLoggedIn, async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const settings = await getSettings(user.id);
        if (!settings.is_configured) settings.timezone = getRequestTimezone(req, settings.timezone);
        res.status(200).json(settings);
    } catch (error) {
        console.error('Failed to load learning settings:', error);
        res.status(500).json({ message: 'Could not load your settings.' });
    }
});

const validateSettings = [
    body('weekly_active_goal').isInt({ min: 1, max: 7 }).withMessage('Weekly active-day goal must be from 1 to 7'),
    body('timezone').isString().isLength({ min: 1, max: 100 }).custom((timezone) => {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
            return true;
        } catch {
            throw new Error('Choose a valid timezone');
        }
    }),
];

router.put('/settings', checkLoggedIn, validateSettings, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const { weekly_active_goal, timezone } = req.body;
        const result = await pg.query(
            'INSERT INTO user_settings (user_id, weekly_active_goal, timezone) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET weekly_active_goal = EXCLUDED.weekly_active_goal, timezone = EXCLUDED.timezone, updated_at = CURRENT_TIMESTAMP RETURNING weekly_active_goal, timezone',
            [user.id, weekly_active_goal, timezone]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update learning settings:', error);
        res.status(500).json({ message: 'Could not update your settings.' });
    }
});

module.exports = router;