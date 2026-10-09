const assert = require('node:assert/strict');
const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET ||= 'backend-test-secret';

const pg = require('../controllers/pg');
const { signToken } = require('../controllers/auth');
const learningRouter = require('../routes/learningRoutes');

const user = { id: 42, username: 'Corevirus', email: 'corevirus@example.test' };
const token = signToken(user);
const app = express();
app.use(express.json());
app.use('/learning', learningRouter);

function isoDateOffset(offset) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
}

describe('learning routes', () => {
    afterEach(() => mock.restoreAll());

    it('requires authentication for history', async () => {
        const response = await request(app).get('/learning/history');

        assert.equal(response.status, 401);
        assert.equal(response.body.message, 'Not logged in');
    });

    it('returns only the requesting user activity with the saved timezone', async () => {
        const activities = [{
            id: '1001',
            course_id: 91,
            course_title: 'Backend API Testing',
            activity_type: 'course_added',
            progress: 0,
            details: { progress: 0 },
            created_at: new Date().toISOString(),
        }];
        const queries = [];
        mock.method(pg, 'query', async (sql, params) => {
            queries.push({ sql, params });
            if (sql.includes('FROM user_settings')) return { rows: [{ weekly_active_goal: 4, timezone: 'Europe/London' }] };
            return { rows: activities };
        });

        const response = await request(app)
            .get('/learning/history?limit=12')
            .set('Authorization', `Bearer ${token}`);

        assert.equal(response.status, 200);
        assert.deepEqual(response.body.activities, activities);
        assert.equal(response.body.timezone, 'Europe/London');
        const activityQuery = queries.find(({ sql }) => sql.includes('FROM learning_activity'));
        assert.deepEqual(activityQuery.params, [user.id, 12]);
    });

    it('calculates the current streak and active days from distinct activity dates', async () => {
        const activityDates = [isoDateOffset(0), isoDateOffset(-1)].map((activity_date) => ({ activity_date }));
        mock.method(pg, 'query', async (sql) => {
            if (sql.includes('FROM user_settings')) return { rows: [{ weekly_active_goal: 4, timezone: 'UTC' }] };
            return { rows: activityDates };
        });

        const response = await request(app)
            .get('/learning/summary')
            .set('Authorization', `Bearer ${token}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.current_streak, 2);
        assert.equal(response.body.longest_streak, 2);
        assert.equal(response.body.active_today, true);
        assert.ok(response.body.active_days_this_week >= 1);
        assert.equal(response.body.weekly_active_goal, 4);
    });

    it('aggregates skill counts and average course progress', async () => {
        mock.method(pg, 'query', async () => ({
            rows: [
                { id: 1, title: 'JavaScript APIs', labels: ['JavaScript', 'REST APIs'], hours_to_complete: 10, progress: 20, completed: false, updated_at: new Date() },
                { id: 2, title: 'JavaScript Capstone', labels: ['JavaScript', 'SQL'], hours_to_complete: 5, progress: 100, completed: true, updated_at: new Date() },
            ],
        }));

        const response = await request(app)
            .get('/learning/insights')
            .set('Authorization', `Bearer ${token}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.course_count, 2);
        assert.equal(response.body.completed_count, 1);
        assert.equal(response.body.planned_hours, 15);
        assert.equal(response.body.average_progress, 60);
        assert.deepEqual(response.body.skills.find((skill) => skill.name === 'JavaScript'), {
            name: 'JavaScript',
            course_count: 2,
            progress_total: 120,
            average_progress: 60,
        });
    });

    it('rejects invalid settings and persists valid weekly goals', async () => {
        const queries = [];
        mock.method(pg, 'query', async (sql, params) => {
            queries.push({ sql, params });
            return { rows: [{ weekly_active_goal: params[1], timezone: params[2] }] };
        });

        const invalidResponse = await request(app)
            .put('/learning/settings')
            .set('Authorization', `Bearer ${token}`)
            .send({ weekly_active_goal: 8, timezone: 'Mars/Olympus' });
        assert.equal(invalidResponse.status, 400);
        assert.equal(queries.length, 0);

        const response = await request(app)
            .put('/learning/settings')
            .set('Authorization', `Bearer ${token}`)
            .send({ weekly_active_goal: 3, timezone: 'America/Los_Angeles' });

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { weekly_active_goal: 3, timezone: 'America/Los_Angeles' });
        assert.deepEqual(queries[0].params, [user.id, 3, 'America/Los_Angeles']);
    });
});