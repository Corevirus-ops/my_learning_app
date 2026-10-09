const assert = require('node:assert/strict');
const { afterEach, describe, it, mock } = require('node:test');
const bcrypt = require('bcrypt');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET ||= 'backend-test-secret';

const pg = require('../controllers/pg');
const authRouter = require('../routes/authRoutes');
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('auth routes', () => {
    afterEach(() => mock.restoreAll());

    it('verifies the stored hash without returning it to the client', async () => {
        const passwordHash = await bcrypt.hash('secret123', 4);
        mock.method(pg, 'query', async () => ({
            rows: [{ id: 42, username: 'Corevirus', email: 'core@example.test', password: passwordHash }],
        }));

        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'Corevirus', password: 'secret123' });

        assert.equal(response.status, 200);
        assert.deepEqual(response.body.user, {
            id: 42,
            username: 'Corevirus',
            email: 'core@example.test',
        });
        assert.equal('password' in response.body.user, false);
        assert.ok(response.body.token);
    });
});