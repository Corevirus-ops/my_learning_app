const assert = require('node:assert/strict');
const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET ||= 'backend-test-secret';

const pg = require('../controllers/pg');
const { signToken } = require('../controllers/auth');
const courseRouter = require('../routes/courseRoutes');

const user = { id: 42, username: 'Corevirus', email: 'corevirus@example.test' };
const token = signToken(user);
const app = express();
app.use(express.json());
app.use('/courses', courseRouter);
let nextClient;

function createClient(queryHandler) {
    const calls = [];
    const client = {
        query: mock.fn(async (sql, params) => {
            calls.push({ sql, params });
            return queryHandler(sql, params);
        }),
        release: mock.fn(),
    };
    nextClient = client;
    return { client, calls };
}

const validCourse = {
    title: 'Backend API Testing',
    description: 'Test a protected course API.',
    hours_to_complete: 12,
    course_link: 'https://example.test/backend-api',
    labels: ['Node.js', 'Testing'],
    progress: 35,
};

describe('course routes', () => {
    beforeEach(() => {
        mock.method(pg, 'query', async () => ({ rows: [] }));
        nextClient = null;
        mock.method(pg, 'connect', async () => nextClient);
    });

    afterEach(() => mock.restoreAll());

    it('requires authentication before reading courses', async () => {
        const response = await request(app).get('/courses');

        assert.equal(response.status, 401);
        assert.equal(response.body.message, 'Not logged in');
        assert.equal(pg.query.mock.calls.length, 0);
    });

    it('rejects non-positive planned hours without opening a database transaction', async () => {
        const response = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${token}`)
            .send({ ...validCourse, hours_to_complete: -100 });

        assert.equal(response.status, 400);
        assert.ok(response.body.errors.some((error) => error.path === 'hours_to_complete'));
        assert.equal(pg.connect.mock.calls.length, 0);
    });

    it('creates a course and activity record in one transaction', async () => {
        const createdCourse = { ...validCourse, id: 91, user_id: user.id, completed: false };
        const { client, calls } = createClient(async (sql) => {
            if (sql.startsWith('INSERT INTO courses')) return { rows: [createdCourse] };
            return { rows: [] };
        });

        const response = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${token}`)
            .send(validCourse);

        assert.equal(response.status, 201);
        assert.deepEqual(response.body.course, createdCourse);
        assert.equal(calls[0].sql, 'BEGIN');
        assert.match(calls[1].sql, /INSERT INTO courses/);
        assert.match(calls[2].sql, /INSERT INTO learning_activity/);
        assert.equal(calls[2].params[0], user.id);
        assert.equal(calls[2].params[1], createdCourse.id);
        assert.equal(calls[2].params[3], 'course_added');
        assert.equal(calls.at(-1).sql, 'COMMIT');
        assert.equal(client.release.mock.calls.length, 1);
    });

    it('records completion when progress changes to 100 percent', async () => {
        const previousCourse = {
            ...validCourse,
            id: 91,
            user_id: user.id,
            progress: 95,
            completed: false,
        };
        const updatedCourse = { ...previousCourse, progress: 100, completed: true };
        const { calls } = createClient(async (sql) => {
            if (sql.startsWith('SELECT * FROM courses')) return { rows: [previousCourse] };
            if (sql.startsWith('UPDATE courses')) return { rows: [updatedCourse] };
            return { rows: [] };
        });

        const response = await request(app)
            .put(`/courses/${previousCourse.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ ...validCourse, progress: 100 });

        assert.equal(response.status, 200);
        assert.equal(response.body.course.completed, true);
        const activityCall = calls.find(({ sql }) => sql.startsWith('INSERT INTO learning_activity'));
        assert.ok(activityCall);
        assert.equal(activityCall.params[3], 'course_completed');
        assert.equal(activityCall.params[4], 100);
    });
});